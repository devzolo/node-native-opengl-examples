import { TsxTeste } from "./react-teste/TsxTeste"

function drawTsx3D(component: any) {
  const { children } = component.props;
  for (const child of children ?? []) {
    drawTsx3D(child);
  }
}


drawTsx3D(TsxTeste());
