import { LIGHTS } from "@/game/config/presentation";
import { AmbientLight, DirectionalLight, Group, HemisphereLight } from "three";

/** Soft, neutral key plus fill. No colored gels and no bloom. */
export function createLights() {
  const group = new Group();
  group.name = "Lights";

  group.add(new AmbientLight(LIGHTS.ambientColor, LIGHTS.ambientIntensity));
  group.add(new HemisphereLight(LIGHTS.hemiSky, LIGHTS.hemiGround, LIGHTS.hemiIntensity));

  const key = new DirectionalLight(LIGHTS.keyColor, LIGHTS.keyIntensity);
  key.position.set(...LIGHTS.keyPosition);
  key.castShadow = true;
  key.shadow.mapSize.set(LIGHTS.shadowMapSize, LIGHTS.shadowMapSize);
  key.shadow.bias = LIGHTS.shadowBias;
  key.shadow.normalBias = LIGHTS.shadowNormalBias;
  key.shadow.camera.near = LIGHTS.shadowNear;
  key.shadow.camera.far = LIGHTS.shadowFar;
  key.shadow.camera.left = -LIGHTS.shadowExtent;
  key.shadow.camera.right = LIGHTS.shadowExtent;
  key.shadow.camera.top = LIGHTS.shadowExtent;
  key.shadow.camera.bottom = -LIGHTS.shadowExtent;
  key.shadow.camera.updateProjectionMatrix();
  group.add(key);
  group.add(key.target);

  const fill = new DirectionalLight(LIGHTS.fillColor, LIGHTS.fillIntensity);
  fill.position.set(...LIGHTS.fillPosition);
  group.add(fill);

  return group;
}
