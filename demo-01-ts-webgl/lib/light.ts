import { Vec3 } from "./vec";

export type PointLight = {
  color: Vec3;
  position: Vec3;
  constant: number;
  linear: number;
  quadratic: number;
} 

export type DirectionalLight = {
  color: Vec3;
  rotation: Vec3;
};

export type AmbientLight = {
  color: Vec3;
}
