export interface Options {
  skip?: number;
  sort?: number;
  limit?: number;
}

export interface InOption {
  fieldName: string;
  values: string[];
}

export interface NinOption {
  fieldName: string;
  values: string[];
}

export interface LikeOption {
  fieldName: string;
  regExpStr: string;
}
