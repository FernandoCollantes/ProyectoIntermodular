export interface ResultadoAprendizaje {
  codigo: string;
  texto: string;
}

export interface ModuloJerarquia {
  nombre: string;
  ras: ResultadoAprendizaje[];
}