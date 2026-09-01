"""
CarAudioAI - Time Alignment & Phase Calculation Engine
Calculates millisecond delay values and phase shifts for each audio channel
to center the soundstage image directly in front of the listener's eyes.
"""
from typing import Dict, Any

# Speed of sound in air at 20°C (cm per millisecond)
SPEED_OF_SOUND_CM_PER_MS = 34.3

def calculate_time_alignment(
    distances_cm: Dict[str, float],
    listening_position: str = "driver_rhd"
) -> Dict[str, Any]:
    """
    Calculate time alignment delays based on physical speaker-to-ear distances.
    
    Args:
        distances_cm: Dictionary of channel names to distances in centimeters.
                      e.g. {"FL": 138, "FR": 95, "RL": 155, "RR": 115, "SUB": 210}
        listening_position: 'driver_rhd' (India), 'driver_lhd', or 'all_cabin'
        
    Returns:
        Dict containing calculated delays in milliseconds, equivalent centimeters, and phase recommendations.
    """
    if not distances_cm:
        return {}
        
    # Find the maximum distance (furthest speaker is reference delay = 0 ms)
    max_distance = max(distances_cm.values())
    
    delays_ms = {}
    delays_cm = {}
    delays_samples_48k = {}
    
    for channel, dist in distances_cm.items():
        delta_distance_cm = max_distance - dist
        delay_ms = round(delta_distance_cm / SPEED_OF_SOUND_CM_PER_MS, 2)
        
        delays_ms[channel] = delay_ms
        delays_cm[channel] = round(delta_distance_cm, 1)
        delays_samples_48k[channel] = int(round((delay_ms / 1000.0) * 48000))
        
    # Phase recommendations for subwoofer acoustic integration
    # Subwoofer acoustic phase in a hatchback/compact SUV boot often requires 180° phase flip or 0° depending on distance
    sub_distance = distances_cm.get("SUB", 210)
    quarter_wave_80hz_cm = (SPEED_OF_SOUND_CM_PER_MS * 1000 / 80) / 4  # ~107 cm
    
    sub_phase_recommendation = (
        "0° (Normal Phase) if sub box fires toward rear hatch. "
        "Test flipping sub phase switch to 180° on amp: whichever produces heavier, tighter bass at the driver seat is correct."
    )
    
    return {
        "listening_position": listening_position,
        "furthest_reference_channel": [k for k, v in distances_cm.items() if v == max_distance][0],
        "delays_milliseconds": delays_ms,
        "delays_equivalent_distance_cm": delays_cm,
        "delays_dsp_samples_48khz": delays_samples_48k,
        "phase_alignment": {
            "front_speakers": "0° (In Phase)",
            "subwoofer_phase": sub_phase_recommendation
        },
        "soundstage_summary": "Sound from all 5 speakers will arrive at the driver's ears at the exact same millisecond, elevating the soundstage above the dashboard."
    }
