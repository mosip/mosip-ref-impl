export interface NavItem {
  displayName: string;
  route?: string;
  icon: string;
  children?: NavItem[];
}
