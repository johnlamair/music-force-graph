import json
import os

def normalize_label(label):
    """Normalize label names by trimming and lowercasing.
    Return 'unknown' for invalid or unrecognized labels.
    """
    if not label or not isinstance(label, str):
        return "unknown"
    clean = label.strip().lower()
    return "unknown" if clean == "unkown" else clean

def convert_to_node_link(json_data, log_path="malformed_entries.log"):
    """Converts JSON to a node-link structure for visualization.

    Args:
        json_data: A nested dictionary containing labels, sublabels, and artists.
        log_path: File path to write malformed entries.

    Returns:
        A dictionary with 'nodes' and 'links' for graph representation.
    """
    nodes = {}
    links = []
    malformed_entries = []

    def add_node(node_id, node_type, **attributes):
        if node_id not in nodes:
            nodes[node_id] = {
                "id": node_id,
                "type": node_type,
                **attributes
            }

    def add_link(source_id, target_id, label=None):
        link = {
            "source": source_id,
            "target": target_id
        }
        if label:
            link["label"] = label
        links.append(link)

    def process_artist(artist, parent_id, label=None, sublabel=None):
        # Skip artist if parent label is unknown
        if label == "unknown":
            return

        artist_name = artist.get("artistName") or artist.get("name")
        if not artist_name:
            malformed_entries.append({
                "reason": "Missing artistName and name",
                "entry": artist
            })
            return

        artist_id = artist.get("artistId", artist_name)
        add_node(
            artist_id,
            "artist",
            name=artist_name,
            label=label,
            sublabel=sublabel
        )
        add_link(parent_id, artist_id, label=label)

        for track in artist.get("topTracks", []):
            song = track.get("song", {})
            song_name = song.get("songName")

            if not song_name:
                malformed_entries.append({
                    "reason": "Missing songName",
                    "artist": artist_name,
                    "entry": track
                })
                continue

            song_id = f"{artist_id}::{song_name}"

            for collaborator in song.get("songCollaborators", []):
                if collaborator != artist_name:
                    add_node(collaborator, "collaborator", name=collaborator)
                    add_link(song_id, collaborator, label=label)

    for raw_label, contents in json_data.items():
        processed_label = normalize_label(raw_label)

        # Skip entire label if it's unknown
        if processed_label == "unknown":
            continue

        add_node(processed_label, "label", label=processed_label)

        if isinstance(contents, list):
            for artist in contents:
                process_artist(artist, parent_id=processed_label, label=processed_label)

        elif isinstance(contents, dict):
            for raw_sublabel, artists in contents.items():
                sublabel = normalize_label(raw_sublabel)

                # Skip sublabel if parent label or sublabel itself is unknown
                if sublabel == "unknown" or processed_label == "unknown":
                    continue

                add_node(sublabel, "sublabel", label=processed_label)
                add_link(processed_label, sublabel, label=processed_label)

                for artist in artists:
                    process_artist(
                        artist,
                        parent_id=sublabel,
                        label=processed_label,
                        sublabel=sublabel
                    )

    with open(log_path, "w", encoding="utf-8") as log_file:
        for entry in malformed_entries:
            log_file.write(
                json.dumps(entry, ensure_ascii=False, indent=2) + "\n"
            )

    return {
        "nodes": list(nodes.values()),
        "links": links
    }

def main():
    """Loads input JSON, processes it, and writes node-link and log files."""
    input_path = (
        "/Users/johnlamair/IdeaProjects/music-force-graph/public/data/Complete_OctavateArtistsList.json"
    )
    output_path = os.path.join(
        os.path.dirname(input_path), "Simplified_OctavateGraph-reduced.json"
    )
    log_path = os.path.join(
        os.path.dirname(input_path), "malformed_entries.log"
    )

    with open(input_path, "r", encoding="utf-8") as infile:
        json_data = json.load(infile)

    result = convert_to_node_link(json_data, log_path=log_path)

    with open(output_path, "w", encoding="utf-8") as outfile:
        json.dump(result, outfile, indent=2)

if __name__ == "__main__":
    main()
