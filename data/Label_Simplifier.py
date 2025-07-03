"""Convert nested label/sublabel/artist JSON to a node-link graph with labeled edges."""

import json
import os

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
            pageURL=artist.get("artistPageURL"),
            Instagram=artist.get("Instagram"),
            TikTok=artist.get("TikTok"),
            YouTube=artist.get("YouTube"),
            Twitter=artist.get("Twitter"),
            Facebook=artist.get("Facebook"),
            totalFollowers=artist.get("totalFollowers"),
            genres=artist.get("genres", []),
            label=label,
            sublabel=sublabel
        )
        add_link(parent_id, artist_id, label=label)

        for track in artist.get("topTracks", []):
            song = track.get("song", {})
            album = track.get("album", {})
            song_name = song.get("songName")

            if not song_name:
                malformed_entries.append({
                    "reason": "Missing songName",
                    "artist": artist_name,
                    "entry": track
                })
                continue

            song_id = f"{artist_id}::{song_name}"
            add_node(
                song_id,
                "song",
                songName=song_name,
                popularity=song.get("songPopularity"),
                duration=song.get("songDuration"),
                explicit=song.get("songExplicit"),
                albumName=album.get("albumName"),
                albumReleaseDate=album.get("albumReleaseDate"),
                albumTotalTracks=album.get("albumTotalTracks")
            )
            add_link(artist_id, song_id, label=label)

            for collaborator in song.get("songCollaborators", []):
                if collaborator != artist_name:
                    add_node(collaborator, "collaborator", name=collaborator)
                    add_link(song_id, collaborator, label=label)

    for label, contents in json_data.items():
        # Label node with label attribute storing its own name
        add_node(label, "label", label=label)

        if isinstance(contents, list):
            # Artists directly under label
            for artist in contents:
                process_artist(artist, parent_id=label, label=label)

        elif isinstance(contents, dict):
            # Sublabels under label, store parent label in sublabel node
            for sublabel, artists in contents.items():
                add_node(sublabel, "sublabel", label=label)
                add_link(label, sublabel, label=label)
                for artist in artists:
                    process_artist(
                        artist,
                        parent_id=sublabel,
                        label=label,
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
        "/Users/johnlamair/Documents/Octavate/3d-music-industry-vis/"
        "Complete_OctavateArtistsList.json"
    )
    output_path = os.path.join(
        os.path.dirname(input_path), "Simplified_OctavateGraph.json"
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
