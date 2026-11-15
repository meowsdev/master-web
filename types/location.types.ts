export interface DistrictOption {
  id: number;
  name: string;
  bnName: string;
}

export interface UpazilaOption extends DistrictOption {
  districtId: number;
}
