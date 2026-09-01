"""
CarAudioAI - Graphic & Parametric EQ Optimizer
Generates target acoustic equalization curves tailored for:
- SQL (Sound Quality + Sound Level for Punjabi, Hip-Hop, EDM)
- Vocal clarity & Harman Car In-Room target
- In-cabin resonance notch filtering & glass reflection compensation
"""
from typing import List, Dict, Any, Optional

# Default 14-band frequencies found on Nakamichi and Android automotive head units
DEFAULT_14_BAND_FREQUENCIES = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000]

def calculate_eq_profile(
    eq_bands: Optional[List[int]] = None,
    sound_profile: str = "sql_punjabi_hiphop",
    cabin_type: str = "compact_suv",
    has_subwoofer: bool = True
) -> Dict[str, Any]:
    """
    Calculate exact EQ slider positions for the head unit graphic equalizer.
    
    Args:
        eq_bands: List of band center frequencies in Hz (e.g. 14 bands on Nakamichi)
        sound_profile: 'sql_punjabi_hiphop', 'harman_reference', or 'vocal_clarity'
        cabin_type: 'compact_suv' (Kylaq/Creta/Brezza), 'hatchback', 'sedan'
        has_subwoofer: Whether a dedicated subwoofer is handling sub-bass
        
    Returns:
        Dict containing band-by-band gain values (dB), visual slider positions, and acoustic rationale.
    """
    if not eq_bands:
        eq_bands = DEFAULT_14_BAND_FREQUENCIES
        
    band_settings = []
    
    for freq in eq_bands:
        # Default gain baseline
        gain_db = 0.0
        rationale = "Neutral baseline"
        
        if sound_profile == "sql_punjabi_hiphop":
            if freq <= 40:
                gain_db = 4.0 if has_subwoofer else 0.0
                rationale = "Deep sub-bass extension (35Hz ported box resonance zone)"
            elif freq <= 65:
                gain_db = 5.5 if has_subwoofer else 1.0
                rationale = "Primary kick-drum and 808 bass punch (+5.5dB dynamic boost)"
            elif freq <= 100:
                gain_db = 2.0
                rationale = "Upper bass impact; modest boost to keep front doors from rattling"
            elif freq <= 250:
                gain_db = -1.5
                rationale = "Cut -1.5dB to prevent cabin mid-bass boom and 'boxy' resonances in compact SUV cabin"
            elif freq <= 500:
                gain_db = 0.0
                rationale = "Lower vocal fundamentals flat and transparent"
            elif freq <= 1000:
                gain_db = 0.5
                rationale = "Male & female vocal intelligibility centered"
            elif freq <= 2000:
                gain_db = 1.0
                rationale = "Snare snap and vocal presence enhancement"
            elif freq <= 4000:
                gain_db = -1.0
                rationale = "Tame harsh windshield & A-pillar glass reflections (ear fatigue zone)"
            elif freq <= 8000:
                gain_db = 1.5
                rationale = "Crisp hi-hats and cymbal definition on Sony tweeters"
            elif freq <= 12000:
                gain_db = 2.0
                rationale = "Airy high-frequency sparkle"
            else:
                gain_db = 1.5
                rationale = "Ultra-high harmonic sparkle without hiss"
                
        elif sound_profile == "harman_reference":
            if freq <= 60:
                gain_db = 3.0
                rationale = "Standard Harman in-cabin target bass shelf"
            elif freq <= 200:
                gain_db = -1.0
                rationale = "Cabin boundary gain correction"
            elif freq <= 3000:
                gain_db = 0.0
                rationale = "Linear reference response"
            else:
                gain_db = -0.5
                rationale = "Natural high-frequency roll-off"
                
        else:  # Flat
            gain_db = 0.0
            rationale = "Flat line"
            
        band_settings.append({
            "frequency_hz": freq,
            "gain_db": round(gain_db, 1),
            "slider_label": f"{freq} Hz",
            "setting_guide": f"{'+' if gain_db > 0 else ''}{gain_db:.1f} dB",
            "rationale": rationale
        })
        
    return {
        "profile_name": sound_profile,
        "total_bands": len(band_settings),
        "bands": band_settings,
        "summary": "Custom 14-band tuning delivering deep, punchy low-end for Punjabi/Hip-Hop/EDM with crystal clear, fatigue-free vocals."
    }
