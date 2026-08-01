/**
 * Pontos distribuídos por espiral de Fibonacci. Distribuição aleatória em
 * esfera empilha nos polos e o erro é visível a olho nu.
 */
export function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
    const ring = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = goldenAngle * i;

    const i3 = i * 3;
    positions[i3] = Math.cos(theta) * ring * radius;
    positions[i3 + 1] = y * radius;
    positions[i3 + 2] = Math.sin(theta) * ring * radius;
  }

  return positions;
}

/**
 * Espaçamento médio entre vizinhos na superfície: raiz da área por ponto.
 * Serve para a distância de ligação escalar junto com raio e contagem, em vez
 * de virar um número mágico por casca.
 */
export function neighborSpacing(count: number, radius: number): number {
  if (count <= 0) return 0;
  return radius * Math.sqrt((4 * Math.PI) / count);
}

/**
 * Pares de vértices para um LineSegments, calculados UMA vez. As cascas são
 * rígidas — os pontos não derivam entre si, só o raio do grupo escala — então
 * a geometria nunca precisa ser reescrita por frame.
 */
export function shellLinkPositions(
  points: Float32Array,
  linkDistance: number,
): Float32Array {
  const count = points.length / 3;
  const maxSq = linkDistance * linkDistance;
  const segments: number[] = [];

  for (let a = 0; a < count; a++) {
    const a3 = a * 3;

    for (let b = a + 1; b < count; b++) {
      const b3 = b * 3;

      const dx = points[a3] - points[b3];
      const dy = points[a3 + 1] - points[b3 + 1];
      const dz = points[a3 + 2] - points[b3 + 2];
      if (dx * dx + dy * dy + dz * dz > maxSq) continue;

      segments.push(
        points[a3], points[a3 + 1], points[a3 + 2],
        points[b3], points[b3 + 1], points[b3 + 2],
      );
    }
  }

  return new Float32Array(segments);
}

/** Interpolação com derivada nula nas pontas: a casca não parte nem para seco. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}
