# Blender Export Guide for Three.js Vertex Colors

This guide will help you properly export your Blender models with vertex colors to ensure they display correctly in Three.js.

## Vertex Color Issues

If your model is showing up without vertex colors or missing elements like eyes, follow these steps:

## GLTF vs GLB Format

While both formats can work, GLTF sometimes handles vertex colors better than GLB:

- **GLTF (.gltf)**: Text-based format, easier to debug, may preserve vertex colors better
- **GLB (.glb)**: Binary format, smaller file size, but sometimes has issues with vertex colors

## Proper Export Steps from Blender

1. **Prepare Your Model**:
   - Make sure vertex colors are properly applied in Vertex Paint mode
   - Ensure materials are set up correctly (see material setup below)
   - Check that all meshes are visible and have proper normals

2. **Export Settings**:
   - Go to `File > Export > glTF 2.0 (.glb/.gltf)`
   - Choose format: **glTF Separate (.gltf)** instead of GLB
   - Enable these options:
     - ✓ **Include > Selected Objects** (if you're only exporting specific objects)
     - ✓ **Include > Vertex Colors**
     - ✓ **Geometry > Apply Modifiers**
     - ✓ **Geometry > UVs**
     - ✓ **Geometry > Normals**
     - ✓ **Materials > Export Materials**
     - ✓ **Materials > Materials > Export** (not "Omit")

3. **Material Setup in Blender**:
   - For meshes with vertex colors:
     - Use the Principled BSDF shader
     - Add a "Vertex Color" node and connect it to "Base Color"
     - Set material color to white (1,1,1) to avoid tinting vertex colors
   - For eyes:
     - Create a separate material for eyes
     - Name the eye meshes with "eye" in the name (e.g., "left_eye")

## Common Issues and Solutions

1. **Missing Vertex Colors**:
   - Make sure "Include > Vertex Colors" is checked during export
   - Check if vertex colors are actually applied in Blender
   - Try exporting as GLTF instead of GLB

2. **Missing Eyes**:
   - Make sure eye meshes are included in the export
   - Check that eye materials are properly set up
   - Ensure eye meshes have proper normals (select and press Shift+N)

3. **Black or Dark Model**:
   - This could be a lighting issue in Three.js
   - Make sure materials aren't too dark
   - Check if normals are correct in Blender

## Testing Your Export

After exporting, you can use the Three.js editor to quickly test if your model looks correct:
https://threejs.org/editor/

Simply drag and drop your .gltf or .glb file into the editor to see how it appears.
