"""
CarAudioAI - Gain Staging & Sensitivity Alignment Engine
Calculates:
- Maximum clean head unit volume limit (prevents pre-out clipping)
- Precise Target AC Output Voltages for Digital Multimeter (DMM) gain tuning
- Approximate physical amplifier gain knob positions (clock face)
"""
import math
from typing import Dict, Any

def calculate_gain_staging(
    head_unit_preout_volts: float = 2.0,
    head_unit_max_volume_steps: int = 40,
    front_rms_watts: float = 45.0,
    front_impedance_ohms: float = 4.0,
    rear_rms_watts: float = 45.0,
    rear_impedance_ohms: float = 4.0,
    sub_rms_watts: float = 250.0,
    sub_impedance_ohms: float = 8.0,  # User's series DVC wiring
) -> Dict[str, Any]:
    """
    Calculate gain staging and target AC voltage calibration measurements.
    
    Returns:
        Dict with DMM target voltages, head unit volume calibration, and physical dial guides.
    """
    # 1. Head unit clean volume limit (typically 75-80% of max steps to avoid DAC clip)
    safe_max_volume = int(head_unit_max_volume_steps * 0.75)
    
    # 2. Front Stage Target Voltage: V = sqrt(P * R)
    # Using 1kHz 0dB test tone
    v_target_front = round(math.sqrt(front_rms_watts * front_impedance_ohms), 2)
    
    # 3. Rear Stage Target Voltage: slightly attenuated for proper front-stage focus (~60% power)
    v_target_rear = round(math.sqrt((rear_rms_watts * 0.6) * rear_impedance_ohms), 2)
    
    # 4. Subwoofer Target Voltage: V = sqrt(P * R)
    # Using 50Hz 0dB (or -5dB for SQL dynamic headroom) test tone
    v_target_sub = round(math.sqrt(sub_rms_watts * sub_impedance_ohms), 2)
    
    return {
        "head_unit_calibration": {
            "preout_voltage": f"{head_unit_preout_volts}V RMS",
            "tuning_volume_level": f"Set Nakamichi Volume to {safe_max_volume} (out of {head_unit_max_volume_steps})",
            "rule": "Never exceed 75-80% volume on head unit during tuning or daily driving to prevent pre-amp clipping."
        },
        "digital_multimeter_calibration": {
            "front_channels_ch1_ch2": {
                "amplifier": "MOCO AF-04 (Front CH1/CH2)",
                "speakers": "Sony XS-162GS 6.5\" Components (45W RMS @ 4Ω)",
                "test_tone": "1000 Hz (1 kHz) 0dB Sine Wave",
                "target_ac_voltage": f"{v_target_front} Volts AC",
                "approx_gain_knob_position": "Approx. 10 to 11 o'clock (based on 2V pre-out)"
            },
            "rear_channels_ch3_ch4": {
                "amplifier": "MOCO AF-04 (Rear CH3/CH4)",
                "speakers": "Sony XS-162GS 6.5\" Coaxials (Attenuated Rear Fill @ 4Ω)",
                "test_tone": "1000 Hz (1 kHz) 0dB Sine Wave",
                "target_ac_voltage": f"{v_target_rear} Volts AC",
                "approx_gain_knob_position": "Approx. 9 to 10 o'clock"
            },
            "subwoofer_channel": {
                "amplifier": "Sound Barrier SB-654 (Bridged Mono)",
                "subwoofer": f"Pioneer TS-W307D4 12\" ({sub_rms_watts}W RMS @ {sub_impedance_ohms}Ω)",
                "test_tone": "50 Hz 0dB (or -5dB for dynamic SQL boost) Sine Wave",
                "target_ac_voltage": f"{v_target_sub} Volts AC",
                "approx_gain_knob_position": "Approx. 11 to 12 o'clock",
                "bass_boost_knob": "MUST BE SET TO 0 dB (OFF)"
            }
        },
        "step_by_step_instructions": [
            "1. Disconnect all speaker wires from amp speaker terminals before testing.",
            f"2. Set head unit volume to {safe_max_volume} and make sure all EQ sliders are FLAT (0 dB).",
            "3. Play a 1 kHz 0dB sine wave through Bluetooth/USB.",
            f"4. Touch DMM probes (set to AC Volts) to MOCO Front +/- terminals and turn gain dial until meter reads {v_target_front}V.",
            f"5. Repeat for Rear channels until meter reads {v_target_rear}V.",
            "6. Switch to 50 Hz 0dB sine wave, connect DMM probes to Sound Barrier bridged mono output, and adjust gain until meter reads " + f"{v_target_sub}V.",
            "7. Turn volume down, reconnect all speaker wires, and enjoy clean, zero-distortion power!"
        ]
    }
