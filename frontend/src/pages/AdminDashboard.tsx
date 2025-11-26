"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import MemberService from "@/services/MemberService";
import PointService from "@/services/PointService";
import ActivityService from "@/services/ActivityService";
import RewardService from "@/services/RewardService";

interface User {
  _id: string;
  username: string;
  email: string;
  walletAddress: string;
  role: string;
  points?: number;
}

interface Activity {
  _id?: string;
  title: string;
  description?: string;
  points: number;
  type?: "add" | "remove";
  createdAt?: Date;
}

interface Reward {
  _id?: string;
  title: string;
  description?: string;
  points: number;
  createdAt?: Date;
}



export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"members" | "activities" | "rewards">("members");
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Member form states
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Activity form states
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityPoints, setActivityPoints] = useState("");
  const [activityType, setActivityType] = useState<"add" | "remove">("add");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Rewards form states
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");

  // Filter activities by type
  const quickAddActivities = activities.filter(a => a.type === "add");
  const quickRemoveActivities = activities.filter(a => a.type === "remove");

  // Load members
  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await MemberService.getAllMembers();
      const membersData: User[] = response.data;

      const membersWithPoints = await Promise.all(
        membersData.map(async (user) => {
          try {
            const balanceRes = await PointService.getBalance(user._id);
            return { ...user, points: Number(balanceRes.data.balance) };
          } catch {
            return { ...user, points: 0 };
          }
        })
      );

      setUsers(membersWithPoints.filter(u => u.role === "member"));
    } catch (error) {
      toast.error("Erreur lors du chargement des membres");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);


  // Load activities
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ActivityService.getAllActivities();
      setActivities(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des activités");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load rewards
  const loadRewards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await RewardService.getAllRewards();
      setRewards(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des récompenses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "members") {
      loadMembers();
      loadActivities();
    } else if (activeTab === "activities") {
      loadActivities();
    } else if (activeTab === "rewards") {
      loadRewards();
    }
  }, [activeTab, loadMembers, loadActivities, loadRewards]);

  // Add member
  const handleAddMember = async (close: () => void) => {
    if (!newUsername || !newEmail || !newWallet || !newPassword) {
      toast.error("Tous les champs sont requis");
      return;
    }

    try {
      const payload = {
        username: newUsername,
        email: newEmail,
        walletAddress: newWallet,
        password: newPassword,
        role: "member",
      };

      const res = await MemberService.addMember(payload);
      const newMember = { ...res.data, points: 0 };

      setUsers(prev => [...prev, newMember]);
      toast.success(`${newUsername} ajouté avec succès !`);

      setNewUsername("");
      setNewEmail("");
      setNewWallet("");
      setNewPassword("");
      close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  // Points actions
  const handlePointsAction = async (
    memberId: string,
    type: "add" | "remove",
    activity: Activity
  ) => {
    const member = users.find(u => u._id === memberId);
    if (!member) return;

    try {
      if (type === "add") {
        await PointService.addPoints({
          userId: memberId,
          amount: activity.points,
          reason: activity.title,
        });
      } else {
        await PointService.adminBurn({
          userId: memberId,
          amount: activity.points,
          reason: activity.title,
        });
      }

      const balanceRes = await PointService.getBalance(memberId);
      const newPoints = Number(balanceRes.data.balance);

      setUsers(prev =>
        prev.map(u => (u._id === memberId ? { ...u, points: newPoints } : u))
      );

      toast.success(
        type === "add"
          ? `+${activity.points} pts pour ${member.username}`
          : `-${activity.points} pts retirés de ${member.username}`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur transaction blockchain");
    }
  };

  // Delete member
  const handleDeleteMember = async (memberId: string) => {
    const member = users.find(u => u._id === memberId);
    if (!member) return;

    if (!confirm(`Supprimer définitivement ${member.username} ?`)) return;

    try {
      await MemberService.deleteMember(memberId);
      setUsers(prev => prev.filter(u => u._id !== memberId));
      toast.success(`${member.username} supprimé`);
    } catch {
      toast.error("Impossible de supprimer ce membre");
    }
  };

  // Add/Update activity
  const handleSaveActivity = async (close: () => void) => {
    if (!activityTitle || !activityPoints) {
      toast.error("Le titre et les points sont requis");
      return;
    }

    const points = parseInt(activityPoints);
    if (isNaN(points) || points < 0) {
      toast.error("Les points doivent être un nombre positif");
      return;
    }

    try {
      const payload = {
        title: activityTitle,
        description: activityDescription,
        points: points,
        type: activityType,
      };

      if (editingActivity?._id) {
        await ActivityService.updateActivity(editingActivity._id, payload);
        setActivities(prev =>
          prev.map(a => (a._id === editingActivity._id ? { ...a, ...payload } : a))
        );
        toast.success("Activité mise à jour !");
      } else {
        const res = await ActivityService.addActivity(payload);
        setActivities(prev => [...prev, res.data]);
        toast.success("Activité créée !");
      }

      setActivityTitle("");
      setActivityDescription("");
      setActivityPoints("");
      setActivityType("add");
      setEditingActivity(null);
      close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activityId: string) => {
    const activity = activities.find(a => a._id === activityId);
    if (!activity) return;

    if (!confirm(`Supprimer l'activité "${activity.title}" ?`)) return;

    try {
      await ActivityService.deleteActivity(activityId);
      setActivities(prev => prev.filter(a => a._id !== activityId));
      toast.success("Activité supprimée");
    } catch {
      toast.error("Impossible de supprimer cette activité");
    }
  };

  // Edit activity
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityTitle(activity.title);
    setActivityDescription(activity.description || "");
    setActivityPoints(activity.points.toString());
    setActivityType(activity.type || "add");
  };

  // Reset activity form
  const resetActivityForm = () => {
    setActivityTitle("");
    setActivityDescription("");
    setActivityPoints("");
    setActivityType("add");
    setEditingActivity(null);
  };

  // Add reward (admin)
  const handleSaveReward = async (close: () => void) => {
    if (!rewardTitle || !rewardPoints) {
      toast.error("Le titre et le nombre de points sont requis");
      return;
    }

    const points = parseInt(rewardPoints);
    if (isNaN(points) || points < 0) {
      toast.error("Les points doivent être un nombre positif");
      return;
    }

    try {
      const payload = {
        title: rewardTitle,
        description: rewardDescription,
        points: points,
      };

      const res = await RewardService.addReward(payload);
      setRewards(prev => [...prev, res.data]);
      toast.success("Récompense ajoutée !");

      setRewardTitle("");
      setRewardDescription("");
      setRewardPoints("");
      close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout de la récompense");
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    const reward = rewards.find(r => r._id === rewardId);
    if (!reward) return;

    if (!confirm(`Supprimer la récompense "${reward.title}" ?`)) return;

    try {
      await RewardService.deleteReward(rewardId);
      setRewards(prev => prev.filter(r => r._id !== rewardId));
      toast.success("Récompense supprimée");
    } catch {
      toast.error("Impossible de supprimer cette récompense");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "members" ? "default" : "ghost"}
                onClick={() => setActiveTab("members")}
              >
                Membres
              </Button>
              <Button
                variant={activeTab === "activities" ? "default" : "ghost"}
                onClick={() => setActiveTab("activities")}
              >
                Activités
              </Button>
              <Button
                variant={activeTab === "rewards" ? "default" : "ghost"}
                onClick={() => setActiveTab("rewards")}
              >
                Récompenses
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Members Tab */}
        {activeTab === "members" && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Gestion des Membres</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg">Ajouter un membre</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouveau membre</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Nom d'utilisateur</Label>
                      <Input value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Adresse Wallet (0x...)</Label>
                      <Input value={newWallet} onChange={e => setNewWallet(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Mot de passe</Label>
                      <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handleAddMember(() => {})}>Ajouter</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-10">Chargement des membres...</div>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Membre</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Points</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-500">
                          Aucun membre pour le moment
                        </td>
                      </tr>
                    ) : (
                      users.map(member => (
                        <tr key={member._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium">{member.username}</td>
                          <td className="px-6 py-4 text-gray-600">{member.email}</td>
                          <td className="px-6 py-4 text-center text-2xl font-bold text-indigo-600">
                            {member.points ?? 0}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Ajouter
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Ajouter des points à {member.username}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-3 py-4">
                                    {quickAddActivities.length === 0 ? (
                                      <p className="text-center text-gray-500 py-4">
                                        Aucune activité disponible. Créez des activités de type "Ajout" dans l'onglet Activités.
                                      </p>
                                    ) : (
                                      quickAddActivities.map(act => (
                                        <Button
                                          key={act._id}
                                          variant="outline"
                                          className="justify-start"
                                          onClick={() => handlePointsAction(member._id, "add", act)}
                                        >
                                          <span className="font-semibold text-green-600">+{act.points}</span>
                                          <span className="ml-3">{act.title}</span>
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    Retirer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Retirer des points à {member.username}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-3 py-4">
                                    {quickRemoveActivities.length === 0 ? (
                                      <p className="text-center text-gray-500 py-4">
                                        Aucune activité disponible. Créez des activités de type "Retrait" dans l'onglet Activités.
                                      </p>
                                    ) : (
                                      quickRemoveActivities.map(act => (
                                        <Button
                                          key={act._id}
                                          variant="destructive"
                                          className="justify-start"
                                          onClick={() => handlePointsAction(member._id, "remove", act)}
                                        >
                                          <span className="font-semibold">-{act.points}</span>
                                          <span className="ml-3">{act.title}</span>
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteMember(member._id)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Gestion des Activités</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={resetActivityForm}>Créer une activité</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingActivity ? "Modifier l'activité" : "Nouvelle activité"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Titre *</Label>
                      <Input
                        value={activityTitle}
                        onChange={e => setActivityTitle(e.target.value)}
                        placeholder="Ex: Participer à un événement"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={activityDescription}
                        onChange={e => setActivityDescription(e.target.value)}
                        placeholder="Description optionnelle..."
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Points *</Label>
                      <Input
                        type="number"
                        value={activityPoints}
                        onChange={e => setActivityPoints(e.target.value)}
                        placeholder="50"
                        min="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Type d'activité *</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="activityType"
                            value="add"
                            checked={activityType === "add"}
                            onChange={e => setActivityType(e.target.value as "add" | "remove")}
                            className="w-4 h-4"
                          />
                          <span className="text-green-600 font-medium">Ajouter des points</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="activityType"
                            value="remove"
                            checked={activityType === "remove"}
                            onChange={e => setActivityType(e.target.value as "add" | "remove")}
                            className="w-4 h-4"
                          />
                          <span className="text-red-600 font-medium">Retirer des points</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={resetActivityForm}>Annuler</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handleSaveActivity(() => {})}>
                        {editingActivity ? "Mettre à jour" : "Créer"}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
      <div className="text-center py-10">Chargement des activités...</div>
    ) : (
      <>
        {/* --- SECTION AJOUT --- */}
        <h3 className="text-xl font-bold text-green-600 mt-8 mb-3">Activités d'ajout</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickAddActivities.length === 0 ? (
            <div className="col-span-full text-center py-6 text-gray-500">
              Aucune activité d'ajout
            </div>
          ) : (
            quickAddActivities.map(activity => (
              <div key={activity._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
                <h4 className="text-lg font-semibold">{activity.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{activity.description}</p>

                <p className="text-green-600 font-bold mt-3">+{activity.points} pts</p>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => handleEditActivity(activity)}>Modifier</Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteActivity(activity._id!)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- SECTION RETRAIT --- */}
        <h3 className="text-xl font-bold text-red-600 mt-12 mb-3">Activités de retrait</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickRemoveActivities.length === 0 ? (
            <div className="col-span-full text-center py-6 text-gray-500">
              Aucune activité de retrait
            </div>
          ) : (
            quickRemoveActivities.map(activity => (
              <div key={activity._id} className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
                <h4 className="text-lg font-semibold">{activity.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{activity.description}</p>

                <p className="text-red-600 font-bold mt-3">-{activity.points} pts</p>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => handleEditActivity(activity)}>Modifier</Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteActivity(activity._id!)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    )}
          </>
        )}

        {activeTab === "rewards" && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Gestion des Récompenses</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg">Créer une récompense</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nouvelle récompense</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Titre *</Label>
                      <Input value={rewardTitle} onChange={e => setRewardTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea
                        value={rewardDescription}
                        onChange={e => setRewardDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Points requis *</Label>
                      <Input
                        type="number"
                        value={rewardPoints}
                        onChange={e => setRewardPoints(e.target.value)}
                        placeholder="100"
                        min="0"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handleSaveReward(() => {})}>Créer</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-10">Chargement des récompenses...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rewards.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-gray-500">Aucune récompense</div>
                ) : (
                  rewards.map(reward => (
                    <div key={reward._id} className="bg-white rounded-xl shadow p-4">
                      <h4 className="text-lg font-semibold">{reward.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{reward.description}</p>

                      <p className="text-indigo-600 font-bold mt-3">{reward.points} pts</p>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReward(reward._id!)}>
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )} 
      </div>
    </div>
  );
}