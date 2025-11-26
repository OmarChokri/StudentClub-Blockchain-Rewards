"use client";

import { useState, useEffect } from "react";
import type { MemberDashboardData } from "@/types/memberDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MemberService from "@/services/MemberService";
import RewardService from "@/services/RewardService";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { frontendBlockchain } from "@/services/Blockchain";
export default function MemberDashboard() {
  const [member, setMember] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "rewards">("overview");

  // Transfer
  const [transferPoints, setTransferPoints] = useState<number>(0);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  // Rewards
  interface Reward {
    _id?: string;
    title: string;
    description?: string;
    points: number;
  }
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [coupons, setCoupons] = useState<Map<string, string>>(new Map());

  function getUserIdFromToken() 
  { if (typeof window === "undefined") return null; const token = localStorage.getItem("token"); if (!token) return null; try { const decoded: any = jwtDecode(token); return decoded.id; 

  } catch (error) { console.error("Invalid token:", error); return null; } }

  // -------------------
  // Fetch Member + Wallet
  // -------------------
  useEffect(() => {
    async function fetchMember() {
      try {
        const userId = getUserIdFromToken();

        const res = await MemberService.getMemberById(userId)
        const walletAddress = await frontendBlockchain.connectWallet(); 

        const balance = walletAddress ? await frontendBlockchain.getBalance() : 0;

        setMember({
          id: res.data.id,
          name: res.data.username,
          email: res.data.email,
          points: balance,
          walletAddress: walletAddress || "",
          activities: res.data.activities ?? [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }
    fetchMember();
  }, []);

  // -------------------
  // Load Rewards
  // -------------------
  const loadRewards = async () => {
    setRewardsLoading(true);
    try {
      const response = await RewardService.getAllRewards();
      setRewards(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des récompenses");
    } finally {
      setRewardsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "rewards") loadRewards();
  }, [activeTab]);

  // -------------------
  // Transfer Points
  // -------------------
  const handleTransferPoints = async () => {
    if (!member) return;
    if (transferPoints <= 0 || transferPoints > member.points) {
      toast.error("Montant invalide");
      return;
    }

    try {
      // 1) Get receiver info
      const receiverRes = await MemberService.getMemberByEmail(recipientEmail);
      const receiverWallet = receiverRes.data.walletAddress;
      if (!receiverWallet) {
        toast.error("Le destinataire n'a pas de wallet connecté");
        return;
      }

      // 2) Transfer points on blockchain
      await frontendBlockchain.transferPoints(receiverWallet, transferPoints);

      // 3) Update frontend state
      const newBalance = await frontendBlockchain.getBalance();
      setMember(prev => prev ? { ...prev, points: newBalance, activities: [
        {
          id: prev.activities.length + 1,
          activity: `Transfert à ${recipientEmail}`,
          points: transferPoints,
          type: "remove",
          date: new Date().toLocaleString()
        },
        ...prev.activities
      ] } : prev);

      toast.success("Transfert effectué !");
      setTransferPoints(0);
      setRecipientEmail("");
      setTransferDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du transfert de points");
    }
  };

  // -------------------
  // Generate Reward Coupon
  // -------------------
  const generateCoupon = async (rewardId: string, rewardTitle: string, points: number) => {
    try {
      await frontendBlockchain.usePoints(points, `Récompense: ${rewardTitle}`);
      const couponCode = `COUPON-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      setCoupons(prev => new Map(prev).set(rewardId, couponCode));
      setMember(prev => prev ? { ...prev, points: prev.points - points } : prev);
      toast.success(`Coupon généré: ${couponCode}`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'utilisation des points pour la récompense");
    }
  };

  const copyCouponToClipboard = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    toast.success("Coupon copié au presse-papiers");
  };

  if (loading) return <p className="p-6">Chargement...</p>;
  if (!member) return <p className="p-6 text-red-600">Membre introuvable</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Membre</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2 px-4 font-semibold ${activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
        >
          Aperçu
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`pb-2 px-4 font-semibold ${activeTab === "rewards" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
        >
          Récompenses
        </button>
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <>
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Solde actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{member.points} pts</p>
            </CardContent>
          </Card>

          {member.walletAddress && (
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Mon Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{member.walletAddress}</p>
              </CardContent>
            </Card>
          )}

          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white">Transférer points</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transférer des points</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 mt-2">
                <div>
                  <Label>Email du destinataire</Label>
                  <Input value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Montant</Label>
                  <Input type="number" value={transferPoints} onChange={e => setTransferPoints(Number(e.target.value))} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button onClick={handleTransferPoints}>Transférer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </>
      )}

      {/* Rewards */}
      {activeTab === "rewards" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Récompenses disponibles</h2>
          {rewardsLoading ? (
            <div className="text-center py-10 text-gray-500">Chargement...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rewards.map(reward => (
                <Card key={reward._id} className="p-4 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{reward.title}</h3>
                    {reward.description && <p className="text-gray-600 text-sm mb-3">{reward.description}</p>}
                    <p className="text-indigo-600 font-bold mb-4">{reward.points} pts requis</p>
                    {member.points >= reward.points 
                      ? <p className="text-green-600 text-sm font-semibold mb-4">✓ Vous avez assez de points</p>
                      : <p className="text-red-600 text-sm font-semibold mb-4">✗ Points insuffisants</p>}
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    {coupons.get(reward._id!) 
                      ? (
                        <div className="bg-green-50 border border-green-200 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-2">Votre coupon:</p>
                          <p className="font-mono font-bold text-sm break-all mb-2">{coupons.get(reward._id!)}</p>
                          <Button size="sm" variant="outline" className="w-full" onClick={() => copyCouponToClipboard(coupons.get(reward._id!)!)}>
                            Copier le coupon
                          </Button>
                        </div>
                      ) : (
                        <Button disabled={member.points < reward.points} onClick={() => generateCoupon(reward._id!, reward.title, reward.points)}>
                          Générer un coupon
                        </Button>
                      )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
