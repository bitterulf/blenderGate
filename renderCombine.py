import bpy, sys, json

argv = sys.argv
argv = argv[argv.index("--") + 1:]

with open('./'+argv[1], 'r') as f:
    config = json.load(f)

    # bpy.data.objects["Plate"].data = bpy.data.meshes[config["shape"]]
    # bpy.context.object.material_slots[0].material = bpy.data.materials[config["mat1"]]
    # bpy.context.object.material_slots[1].material = bpy.data.materials[config["mat2"]]

    bpy.data.objects["Corner1"].dupli_group = bpy.data.groups[config["Corner1"]]
    bpy.data.objects["Corner2"].dupli_group = bpy.data.groups[config["Corner2"]]
    bpy.data.objects["Corner3"].dupli_group = bpy.data.groups[config["Corner3"]]
    bpy.data.objects["Corner4"].dupli_group = bpy.data.groups[config["Corner4"]]

    scene = bpy.data.scenes["Scene"]

    scene.render.resolution_percentage = 25
    bpy.context.scene.render.filepath = '//'+argv[0]
    bpy.ops.render.render( write_still=True )
