import { Component } from "react";

export const hasWebGL = (() => {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
})();

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Renders `fallback` when WebGL is missing or the 3D scene throws (e.g. context creation fails).
export class WebGLBoundary extends Component {
  state = { failed: !hasWebGL };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("3D scene failed, showing the 2D fallback:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
