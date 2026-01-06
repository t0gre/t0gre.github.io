import { Color, Vec3, Euler } from "./vec";

export type PointLight = {
  color: Color;
  position: Vec3;
  constant: number;
  linear: number;
  quadratic: number;
} 

export type DirectionalLight = {
  color: Color;
  rotation: Euler;
};

export type AmbientLight = {
  color: Color;
}
