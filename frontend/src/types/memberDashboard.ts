// types/memberDashboard.ts

export interface MemberActivity {
  id: number;
  activity: string;       // Nom de l'activité ou de l'événement
  points: number;         // Points gagnés ou perdus
  type: "add" | "remove"; // Ajout ou retrait de points
  date: string;           // Date de l'action
}

export interface MemberDashboardData {
  id: number;
  name: string;
  email: string;
  points: number;               // Solde actuel du membre
  walletAddress?: string;       // Adresse wallet (optionnelle)
  activities: MemberActivity[]; // Historique des points
}
