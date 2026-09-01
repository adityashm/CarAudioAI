"""
CarAudioAI - DSP Configuration Exporter
Generates ready-to-import configuration files and formatted presets for:
- Pioneer DEH-80PRS (XML Format)
- MiniDSP 2x4 / 4x10 (JSON/Biquad Format)
- Generic Text Configuration Cheat Sheet
"""
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import Dict, Any

def export_pioneer_xml(tuning_data: Dict[str, Any]) -> str:
    """
    Format tuning parameters into Pioneer DEH-80PRS DSP XML structure.
    """
    root = ET.Element("PioneerDSPConfig", version="1.0")
    
    # Metadata
    meta = ET.SubElement(root, "Metadata")
    ET.SubElement(meta, "Car").text = tuning_data.get("car", "Custom Vehicle")
    ET.SubElement(meta, "Profile").text = tuning_data.get("sound_target", "SQL")
    
    # Equalizer
    eq_elem = ET.SubElement(root, "Equalizer", type="Graphic14Band")
    eq_bands = tuning_data.get("head_unit_14_band_eq", {}).get("bands", [])
    for band in eq_bands:
        b_elem = ET.SubElement(eq_elem, "Band", freq=str(band.get("frequency_hz")))
        b_elem.text = str(band.get("gain_db"))
        
    # Crossovers
    xo_elem = ET.SubElement(root, "CrossoverNetwork")
    xo_data = tuning_data.get("crossover_configuration", {})
    if "front" in xo_data:
        f = ET.SubElement(xo_elem, "Front", type="HPF", freq=str(xo_data["front"].get("cutoff_frequency_hz", 80)), slope="24dB")
    if "rear" in xo_data:
        r = ET.SubElement(xo_elem, "Rear", type="HPF", freq=str(xo_data["rear"].get("cutoff_frequency_hz", 90)), slope="12dB")
    if "subwoofer" in xo_data:
        s = ET.SubElement(xo_elem, "Subwoofer", type="LPF", freq=str(xo_data["subwoofer"].get("lpf_frequency_hz", 80)), subsonic=str(xo_data["subwoofer"].get("subsonic_filter_hz", 28)))
        
    # Time Alignment
    ta_elem = ET.SubElement(root, "TimeAlignment")
    ta_delays = tuning_data.get("time_alignment_and_phase", {}).get("delays_milliseconds", {})
    for ch, delay in ta_delays.items():
        ET.SubElement(ta_elem, "Channel", name=ch, delay_ms=str(delay))
        
    # Pretty XML string
    xml_str = ET.tostring(root, encoding="utf-8")
    parsed = minidom.parseString(xml_str)
    return parsed.toprettyxml(indent="  ")

def export_minidsp_json(tuning_data: Dict[str, Any]) -> str:
    """
    Format tuning parameters into MiniDSP JSON configuration structure.
    """
    minidsp_data = {
        "version": "1.0",
        "device": "MiniDSP 2x4 HD / C-DSP",
        "car": tuning_data.get("car", "Custom Vehicle"),
        "sound_profile": tuning_data.get("sound_target", "SQL"),
        "routing": {
            "Input 1/2": ["Out 1 (Front Left)", "Out 2 (Front Right)", "Out 3 (Rear Fill)", "Out 4 (Subwoofer)"]
        },
        "crossover": tuning_data.get("crossover_configuration", {}),
        "delays_ms": tuning_data.get("time_alignment_and_phase", {}).get("delays_milliseconds", {}),
        "peq_bands": tuning_data.get("head_unit_14_band_eq", {}).get("bands", [])
    }
    return json.dumps(minidsp_data, indent=2)
