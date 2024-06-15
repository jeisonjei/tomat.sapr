import ezdxf
from ezdxf.enums import TextEntityAlignment
import json

def createFile(shapes):
    pythoShapes = json.loads(shapes)
    for shape in pythoShapes:
        if getattr(shape, '_id', None) is not None:
            print(shape._id)
        else:
            print(shape._id)
    doc = ezdxf.new(dxfversion='AC1027')
    msp = doc.modelspace()
    # Using a predefined text style:
    msp.add_text(
        "Hello World!",
        height=0.35,
        dxfattribs={"style": "cyrillic_ii"}
    ).set_placement((2, 6), align=TextEntityAlignment.LEFT)

    doc.saveas('/my_file.dxf')


