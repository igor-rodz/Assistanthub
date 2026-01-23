
export enum ViewType {
  PROFILE = 'Perfil',
  SUBSCRIPTION = 'Assinatura',
  CREDITS = 'Créditos'
}

export interface UserStats {
  analyses: number;
  savedPrompts: number;
  usedTokens: string;
}

export interface UserProfile {
  name: string;
  fullName: string;
  email: string;
  language: string;
  memberSince: string;
}

export interface SubscriptionData {
  plan: string;
  status: 'Ativo' | 'Inativo';
  value: string;
  nextBilling: string;
}
