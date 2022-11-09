

import GL from '@devzolo/node-native-gl';

interface VertexProps {
  x: number;
  y: number;
  z: number;
}

export function Vertex({ x, y, z }: VertexProps) {
  GL.vertex3d(x, y, z);
  return <></>
}


export function Quad() {
  return (
    <>
      <Vertex x={-1} y={-1} z={-1} />
      <Vertex x={1} y={-1} z={-1} />
      <Vertex x={1} y={1} z={-1} />
      <Vertex x={-1} y={1} z={-1} />
      <Vertex x={-1} y={-1} z={1} />
      <Vertex x={1} y={-1} z={1} />
      <Vertex x={1} y={1} z={1} />
      <Vertex x={-1} y={1} z={1} />
    </>
  );
}

export function Container({ children }: any) {
  return <>{children}</>;
}

export function TsxTeste() {
  return (
    <Container>
      <Quad />
      <Quad />
    </Container>
  );
}
