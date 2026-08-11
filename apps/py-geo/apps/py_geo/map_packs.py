"""Hardcoded map packs — puzzles on real Mapillary coverage + map features.

Answer lat/lng = Mapillary map-feature coordinates (the object itself).
imageId = a panorama next to that object; Interact also succeeds on that frame.
"""

MAP_PACKS = {
    "catalina-poc": {
        "id": "catalina-poc",
        "name": "Catalina POC (100 m)",
        "bbox": {
            "south": 33.34425,
            "west": -118.32725,
            "north": 33.34515,
            "east": -118.32615,
        },
        "start": {
            "lat": 33.344816956699,
            "lng": -118.32687565137,
            "imageId": "1182252392217616",
        },
        "steps": [
            {
                "id": "clue-1",
                "clueText": (
                    "Find the red octagon that tells traffic to halt."
                ),
                "answerLabel": "Stop sign",
                # map feature regulatory--stop--g1
                "lat": 33.344887,
                "lng": -118.32671,
                "imageId": "170278004982541",
                # Nearby frames that also see/stand by the stop sign
                "acceptedImageIds": [
                    "170278004982541",
                    "1974833389359706",
                    "904627333716567",
                    "494893214893936",
                    "871897523721104",
                ],
                "radiusMeters": 25,
            },
            {
                "id": "clue-2",
                "clueText": (
                    "Seek the metal bin waiting for litter beside the path."
                ),
                "answerLabel": "Trash can",
                # map feature object--trash-can
                "lat": 33.344673,
                "lng": -118.32679,
                "imageId": "509992236687312",
                "acceptedImageIds": [
                    "509992236687312",
                    "144539510913332",
                    "474896533828546",
                    "313857077056870",
                ],
                "radiusMeters": 25,
            },
            {
                "id": "treasure",
                "clueText": (
                    "The treasure hides by a shopfront notice — stand where "
                    "a store sign faces the street and claim it."
                ),
                "answerLabel": "Store sign",
                # map feature object--sign--store
                "lat": 33.344547,
                "lng": -118.3267,
                "imageId": "223885939068053",
                "acceptedImageIds": [
                    "223885939068053",
                    "949525529145381",
                    "4053821927989469",
                    "509249327186492",
                ],
                "radiusMeters": 25,
            },
        ],
    }
}
