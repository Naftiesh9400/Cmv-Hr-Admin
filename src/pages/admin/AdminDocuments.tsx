import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { FileText, Trash2, Plus, Link as LinkIcon, User, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminDocuments() {
  const db = getFirestore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: "",
    type: "PDF",
    url: "",
    userId: "all"
  });

  useEffect(() => {
    const unsubDocs = onSnapshot(query(collection(db, "documents"), orderBy("createdAt", "desc")), (snap) => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubDocs(); unsubUsers(); };
  }, [db]);

  const handleAddDocument = async () => {
    if (!newDoc.name || !newDoc.url) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await addDoc(collection(db, "documents"), {
        ...newDoc,
        size: "N/A", // Since it's a link, size is unknown/irrelevant
        date: format(new Date(), "MMM dd, yyyy"),
        createdAt: serverTimestamp()
      });
      toast.success("Document added successfully");
      setIsDialogOpen(false);
      setNewDoc({ name: "", type: "PDF", url: "", userId: "all" });
    } catch (error) {
      toast.error("Failed to add document");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "documents", id));
      toast.success("Document deleted");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <DashboardLayout isAdmin>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Documents</h1>
            <p className="text-muted-foreground mt-1">Manage employee documents and company policies</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Document</DialogTitle>
                <DialogDescription>Upload a document link (e.g., Google Drive) for employees.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input placeholder="e.g. Employment Contract" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Document Link (URL)</Label>
                  <Input placeholder="https://drive.google.com/..." value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newDoc.type} onValueChange={val => setNewDoc({...newDoc, type: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOCX">DOCX</SelectItem>
                        <SelectItem value="LINK">Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign To</Label>
                    <Select value={newDoc.userId} onValueChange={val => setNewDoc({...newDoc, userId: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.displayName || u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDocument}>Add Document</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {doc.name}
                  </TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>
                    {doc.userId === 'all' ? (
                      <span className="text-muted-foreground">All Employees</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {users.find(u => u.id === doc.userId)?.displayName || "Unknown User"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No documents found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}