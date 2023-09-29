import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import GltfVrmParser from '../utils/GltfVrmParser';

export default function GlobalVrmMToonLightingSettingsForm({ gltfVrmParser }) {
  const handleLightingChangeSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData);

    const skipMaterialNameSet = new Set(formData.getAll('skipMaterialName'));
    console.log('SKIPPING', skipMaterialNameSet);

    const propertyNameToFloatMap = new Map();
    propertyNameToFloatMap.set(
      '_LightColorAttenuation',
      Number(formData.get('_LightColorAttenuation')),
    );
    propertyNameToFloatMap.set(
      '_IndirectLightIntensity',
      Number(formData.get('_IndirectLightIntensity')),
    );

    gltfVrmParser.setMaterialGlobalFloatProperties({
      propertyNameToFloatMap,
      skipMaterialNameSet,
    });
  };

  return (
    <Form onSubmit={handleLightingChangeSubmit}>
      <h2>Global MToon Lighting Settings</h2>
      <Form.Group>
        <Form.Label>Global MToon Light Color Attenuation</Form.Label>
        <Form.Control name="_LightColorAttenuation" defaultValue="1" />
        <Form.Text>
          Set the influence of the light source color. 0: Affected by the light
          source color. 1: Not affected by the light source color. It only
          reflects the luminance of the light source color.
        </Form.Text>
      </Form.Group>
      <Form.Group>
        <Form.Label>Global MToon Indirect Light Intensity</Form.Label>
        <Form.Control name="_IndirectLightIntensity" defaultValue="0" />
      </Form.Group>
      <Form.Group>
        <Form.Label>Material Skips</Form.Label>
        <Form.Control as="select" name="skipMaterialName" multiple>
          {gltfVrmParser?.materialNames.map((materialName) => (
            <option
              value={materialName}
              key={`skipMaterialName.${materialName}`}
            >
              {materialName}
            </option>
          ))}
        </Form.Control>
        <Form.Text>
          Select material(s) to skip from applying global settings.
        </Form.Text>
      </Form.Group>
      <Button variant="primary" type="submit">
        Apply Global Lighting Settings
      </Button>
    </Form>
  );
}

GlobalVrmMToonLightingSettingsForm.propTypes = {
  gltfVrmParser: PropTypes.instanceOf(GltfVrmParser),
};
GlobalVrmMToonLightingSettingsForm.defaultProps = {
  gltfVrmParser: null,
};