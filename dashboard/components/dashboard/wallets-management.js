"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, Plus, Pencil, Trash2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUsersContext } from "../../app/AllContext/UsersContext"

export default function WalletsManagement() {
    const { addWallet, getWallets, updateWallet, deleteWallet } = useUsersContext()
    const { toast } = useToast()

    const [wallets, setWallets] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        walletName: "",
        walletAddress: "",
    })
    const [editingWallet, setEditingWallet] = useState(null)
    const [deletingWallet, setDeletingWallet] = useState(null)

    // Fetch wallets on component mount
    useEffect(() => {
        fetchWallets()
    }, [])

    const fetchWallets = async () => {
        setLoading(true)
        try {
            const data = await getWallets()
            setWallets(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch wallets",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddWallet = async () => {
        if (!formData.walletName || !formData.walletAddress) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        const result = await addWallet(formData)
        setLoading(false)

        if (result.success) {
            toast({
                title: "Success",
                description: "Wallet added successfully",
            })
            setIsAddDialogOpen(false)
            setFormData({ walletName: "", walletAddress: "" })
            fetchWallets()
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to add wallet",
                variant: "destructive",
            })
        }
    }

    const handleEditWallet = async () => {
        if (!formData.walletName || !formData.walletAddress) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        const result = await updateWallet(editingWallet._id, formData)
        setLoading(false)

        if (result.success) {
            toast({
                title: "Success",
                description: "Wallet updated successfully",
            })
            setIsEditDialogOpen(false)
            setFormData({ walletName: "", walletAddress: "" })
            setEditingWallet(null)
            fetchWallets()
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to update wallet",
                variant: "destructive",
            })
        }
    }

    const handleDeleteWallet = async () => {
        setLoading(true)
        const result = await deleteWallet(deletingWallet._id)
        setLoading(false)

        if (result.success) {
            toast({
                title: "Success",
                description: "Wallet deleted successfully",
            })
            setIsDeleteDialogOpen(false)
            setDeletingWallet(null)
            fetchWallets()
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to delete wallet",
                variant: "destructive",
            })
        }
    }

    const openEditDialog = (wallet) => {
        setEditingWallet(wallet)
        setFormData({
            walletName: wallet.walletName,
            walletAddress: wallet.walletAddress,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (wallet) => {
        setDeletingWallet(wallet)
        setIsDeleteDialogOpen(true)
    }

    const filteredWallets = wallets.filter(
        (wallet) =>
            wallet.walletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wallet.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Wallet className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl text-slate-100">Manage Wallets</CardTitle>
                                <CardDescription className="text-slate-400">Add, edit, and manage deposit wallets</CardDescription>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Wallet
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search wallets by name or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-800/60 border-slate-700 text-slate-100"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && wallets.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">Loading wallets...</div>
                    ) : filteredWallets.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            {searchQuery ? "No wallets found matching your search" : "No wallets added yet"}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-slate-800 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-800/60 hover:bg-slate-800/60">
                                        <TableHead className="text-slate-300">Wallet Name</TableHead>
                                        <TableHead className="text-slate-300">Wallet Address</TableHead>
                                        <TableHead className="text-slate-300">Created At</TableHead>
                                        <TableHead className="text-right text-slate-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWallets.map((wallet) => (
                                        <TableRow key={wallet._id} className="border-slate-800 hover:bg-slate-800/40">
                                            <TableCell className="font-medium text-slate-100">{wallet.walletName}</TableCell>
                                            <TableCell className="text-slate-300 font-mono text-sm">{wallet.walletAddress}</TableCell>
                                            <TableCell className="text-slate-400">
                                                {new Date(wallet.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(wallet)}
                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/20"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(wallet)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Wallet Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-slate-100">Add New Wallet</DialogTitle>
                        <DialogDescription className="text-slate-400">Enter the wallet details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="walletName" className="text-slate-300">
                                Wallet Name
                            </Label>
                            <Input
                                id="walletName"
                                placeholder="e.g., Main Bitcoin Wallet"
                                value={formData.walletName}
                                onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                                className="bg-slate-800/60 border-slate-700 text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="walletAddress" className="text-slate-300">
                                Wallet Address
                            </Label>
                            <Input
                                id="walletAddress"
                                placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                                value={formData.walletAddress}
                                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                                className="bg-slate-800/60 border-slate-700 text-slate-100 font-mono text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddDialogOpen(false)
                                setFormData({ walletName: "", walletAddress: "" })
                            }}
                            className="bg-slate-800 border-slate-700 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddWallet}
                            disabled={loading}
                            className="bg-gradient-to-r from-green-500 to-emerald-600"
                        >
                            {loading ? "Adding..." : "Add Wallet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Wallet Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-slate-100">Edit Wallet</DialogTitle>
                        <DialogDescription className="text-slate-400">Update the wallet details below</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editWalletName" className="text-slate-300">
                                Wallet Name
                            </Label>
                            <Input
                                id="editWalletName"
                                placeholder="e.g., Main Bitcoin Wallet"
                                value={formData.walletName}
                                onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                                className="bg-slate-800/60 border-slate-700 text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editWalletAddress" className="text-slate-300">
                                Wallet Address
                            </Label>
                            <Input
                                id="editWalletAddress"
                                placeholder="e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                                value={formData.walletAddress}
                                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                                className="bg-slate-800/60 border-slate-700 text-slate-100 font-mono text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false)
                                setFormData({ walletName: "", walletAddress: "" })
                                setEditingWallet(null)
                            }}
                            className="bg-slate-800 border-slate-700 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditWallet}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 to-blue-600"
                        >
                            {loading ? "Updating..." : "Update Wallet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-slate-100">Delete Wallet</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Are you sure you want to delete this wallet? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deletingWallet && (
                        <div className="bg-slate-800/60 p-4 rounded-lg space-y-2">
                            <p className="text-slate-300">
                                <span className="font-semibold">Name:</span> {deletingWallet.walletName}
                            </p>
                            <p className="text-slate-300 font-mono text-sm break-all">
                                <span className="font-semibold">Address:</span> {deletingWallet.walletAddress}
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setDeletingWallet(null)
                            }}
                            className="bg-slate-800 border-slate-700 text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteWallet}
                            disabled={loading}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                            {loading ? "Deleting..." : "Delete Wallet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
