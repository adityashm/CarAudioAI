"""
CarAudioAI - Crossover Calculation Engine
Calculates optimal crossover points, slopes, and filter configurations for:
- Front 2-way / 3-way component systems
- Rear fill speakers
- Sealed and Ported subwoofers with subsonic protection
"""
from typing import Dict, Any, Optional

def calculate_crossover_settings(
    front_speaker_type: str = "component",
    front_speaker_size: str = "6.5",
    has_subwoofer: bool = True,
    subwoofer_enclosure: str = "ported",
    subwoofer_tune_freq_hz: float = 35.0,
    rear_speakers_present: bool = True
) -> Dict[str, Any]:
    """
    Calculate safe and optimal acoustic crossover frequencies and slopes.
    
    Returns:
        Dict containing front, rear, and subwoofer crossover settings and dial positions.
    """
    settings = {}
    
    # 1. Front Stage Settings
    if has_subwoofer:
        if "6.5" in front_speaker_size:
            front_hpf_freq = 80
        elif "5.25" in front_speaker_size or "4" in front_speaker_size:
            front_hpf_freq = 100
        else:
            front_hpf_freq = 80
        
        settings["front"] = {
            "filter_type": "HPF (High Pass Filter)",
            "cutoff_frequency_hz": front_hpf_freq,
            "slope": "12dB/octave or 24dB/octave Linkwitz-Riley",
            "physical_dial_position": f"Set Front Amp HPF switch to ON, dial to ~{front_hpf_freq}Hz (approx. 9 to 10 o'clock)",
            "purpose": "Protects Sony 6.5\" woofers from excessive cone excursion, ensuring crisp midrange and vocal clarity."
        }
    else:
        settings["front"] = {
            "filter_type": "Full / Off",
            "cutoff_frequency_hz": None,
            "slope": "Flat",
            "physical_dial_position": "Set Amp switch to FULL",
            "purpose": "Full range reproduction."
        }
        
    # 2. Rear Stage Settings (Rear Fill)
    if rear_speakers_present:
        rear_hpf_freq = 90 if has_subwoofer else 60
        settings["rear"] = {
            "filter_type": "HPF (High Pass Filter)",
            "cutoff_frequency_hz": rear_hpf_freq,
            "slope": "12dB/octave",
            "physical_dial_position": f"Set Rear Amp HPF switch to ON, dial to ~{rear_hpf_freq}Hz (approx. 10 o'clock)",
            "level_attenuation_db": -4.0,
            "purpose": "Attenuated rear fill creates spatial ambiance without pulling the vocal soundstage behind the driver."
        }
        
    # 3. Subwoofer Settings
    if has_subwoofer:
        sub_lpf_freq = 80
        if subwoofer_enclosure.lower() == "ported":
            subsonic_freq = round(max(20.0, subwoofer_tune_freq_hz - 7.0))
            subsonic_explanation = (
                f"CRITICAL FOR PORTED BOX: Below the {subwoofer_tune_freq_hz}Hz box tuning, "
                f"cone motion unloads rapidly. A subsonic HPF @ {subsonic_freq}Hz prevents mechanical bottoming out and voice coil burnout."
            )
        else:
            subsonic_freq = 20
            subsonic_explanation = "Sealed enclosures have natural air cushioning; subsonic filter at 20Hz protects against infrasonic rumble."
            
        settings["subwoofer"] = {
            "lpf_frequency_hz": sub_lpf_freq,
            "lpf_slope": "12dB to 24dB/octave",
            "lpf_dial_position": f"Set Sub Amp switch to LPF, dial to ~{sub_lpf_freq}Hz (approx. 10 to 11 o'clock)",
            "subsonic_filter_hz": subsonic_freq,
            "subsonic_dial_position": f"Set Subsonic dial (if available on amp/DSP) to ~{subsonic_freq}Hz",
            "subsonic_rationale": subsonic_explanation,
            "bass_boost_recommendation": "Set Bass Boost knob to 0 dB (OFF). Bass boost introduces heavy phase distortion and amplifier clipping."
        }
        
    return settings
