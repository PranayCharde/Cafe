import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { socket, orderBroadcastChannel } from "@/lib/socket";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Coffee,
  ShieldCheck,
  QrCode,
  Utensils,
  LogOut,
  RefreshCw,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Bell,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Printer,
  Plus,
  Trash2,
  XCircle,
  ExternalLink,
  Download,
  Eye,
  Check,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Reliable Web Audio API sound synthesizer for real-time kitchen chime
function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6

    gainNode.gain.setValueAtTime(0.35, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.warn("Audio chime error:", err);
  }
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { adminUser, token, isAuthenticated, logout } = useAdminAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("orders"); // "orders" or "tables"
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  // Selected Order for Full Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Printable Single Table Stand Modal
  const [printTableStand, setPrintTableStand] = useState(null);

  // Add Table Form State
  const [newTableNum, setNewTableNum] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [isAddingTable, setIsAddingTable] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:5000";
  const apiBase = "http://localhost:5001/api";

  // Auth Protection: Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || adminUser?.role !== "admin") {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, adminUser, setLocation]);

  // Socket Connection Watcher
  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Fetch Orders
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`${apiBase}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.warn("Could not fetch orders from API:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch Tables
  const fetchTables = async () => {
    try {
      const res = await fetch(`${apiBase}/tables`);
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch (err) {
      console.warn("Could not fetch tables from API:", err);
    }
  };

  // Real-time Event Subscriptions
  useEffect(() => {
    fetchOrders();
    fetchTables();

    socket.emit("join_admin");

    const handleNewOrder = (newOrder) => {
      console.log("🔔 [Socket] Incoming Order:", newOrder);
      if (soundEnabled) {
        playChimeSound();
      }

      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      fetchTables(); // Refresh tables to reflect occupancy

      toast({
        title: `🔔 New Order #${newOrder.id}!`,
        description: `${newOrder.tableNumber ? `Table #${newOrder.tableNumber}` : "Delivery"} • ${
          newOrder.customerName
        } • ₹${Number(newOrder.totalAmount).toFixed(2)}`,
      });
    };

    const handleStatusUpdate = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
      );
      fetchTables();
    };

    const handleOrderDeleted = ({ id }) => {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      fetchTables();
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_updated", handleStatusUpdate);
    socket.on("order_deleted", handleOrderDeleted);

    if (orderBroadcastChannel) {
      orderBroadcastChannel.onmessage = (event) => {
        if (event.data?.type === "new_order") {
          handleNewOrder(event.data.order);
        }
      };
    }

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_updated", handleStatusUpdate);
      socket.off("order_deleted", handleOrderDeleted);
    };
  }, [soundEnabled, token]);

  // Status Update Handler
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${apiBase}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        fetchTables();
        toast({
          title: "Status Updated",
          description: `Order #${orderId} marked as ${newStatus}.`,
        });
      } else {
        const err = await res.json();
        toast({ title: "Update Failed", description: err.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Network error", description: err.message, variant: "destructive" });
    }
  };

  // Delete Order Handler
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to remove Order #${orderId}?`)) return;

    try {
      const res = await fetch(`${apiBase}/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
        fetchTables();
        toast({ title: "Order Removed", description: `Order #${orderId} was removed.` });
      }
    } catch (err) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  // Admin Generate New Table QR
  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;

    setIsAddingTable(true);
    try {
      const res = await fetch(`${apiBase}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableNumber: parseInt(newTableNum, 10),
          capacity: parseInt(newTableCapacity, 10),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTables((prev) => [...prev, data.table].sort((a, b) => a.tableNumber - b.tableNumber));
        setNewTableNum("");
        toast({
          title: "Table QR Generated!",
          description: `Table #${data.table.tableNumber} added to the system.`,
        });
      } else {
        toast({ title: "Failed", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsAddingTable(false);
    }
  };

  // Delete Table
  const handleDeleteTable = async (tableNum) => {
    if (!window.confirm(`Remove Table #${tableNum} and its QR code?`)) return;

    try {
      const res = await fetch(`${apiBase}/tables/${tableNum}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTables((prev) => prev.filter((t) => t.tableNumber !== tableNum));
        toast({ title: "Table Removed", description: `Table #${tableNum} was deleted.` });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // WhatsApp Customer Status Update
  const handleSendWhatsAppUpdate = (order) => {
    const statusMap = {
      pending: "has been received and confirmed by the kitchen ✅",
      preparing: "is currently being prepared fresh in the kitchen 🍳",
      ready: "is READY to be served at your table! 🔔",
      completed: "has been served. Thank you for dining with Bean & Brew! ☕",
      cancelled: "could not be processed and has been cancelled ❌",
    };

    const text =
      `Hi ${order.customerName},\n` +
      `Your Bean & Brew Order #${order.id}${order.tableNumber ? ` (Table #${order.tableNumber})` : ""} ` +
      `${statusMap[order.status] || "is updated."}\n\n` +
      `Total: ₹${Number(order.totalAmount).toFixed(2)}\n` +
      `Need anything else? Let us know!`;

    const url = createWhatsAppLink(order.mobileNumber, text);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Download QR Code as SVG
  const handleDownloadSVG = (tableNum) => {
    const svgElement = document.getElementById(`qr-svg-table-${tableNum}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `BeanBrew-Table-${tableNum}-QR.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Filtered Orders Calculation
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesType =
      orderTypeFilter === "all" ||
      (orderTypeFilter === "dine-in" && order.tableNumber) ||
      (orderTypeFilter === "delivery" && !order.tableNumber);
    const matchesTable =
      tableFilter === "all" || String(order.tableNumber) === String(tableFilter);
    const matchesSearch =
      !searchTerm ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobileNumber?.includes(searchTerm) ||
      String(order.id).includes(searchTerm);

    return matchesStatus && matchesType && matchesTable && matchesSearch;
  });

  // KPI Metrics
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const activeTablesCount = tables.filter((t) => t.activeOrdersCount > 0).length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-secondary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Admin Control Bar */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Master Kitchen & Admin Portal
                </h1>
                <span
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    socketConnected
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      socketConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  ></span>
                  {socketConnected ? "Socket Live" : "Connecting..."}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authorized Admin: <strong className="text-foreground">{adminUser?.name || "Master Admin"}</strong> ({adminUser?.email})
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-muted/40 p-1 rounded-2xl border border-border flex items-center">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "orders"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Live Kitchen Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("tables")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "tables"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Table QR Station ({tables.length})
              </button>
            </div>

            {/* Sound Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChimeSound();
              }}
              className="rounded-xl h-10 border-border flex items-center gap-1.5 text-xs font-semibold"
              title={soundEnabled ? "Mute order sound" : "Enable order sound"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Chime ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchOrders();
                fetchTables();
                toast({ title: "Refreshed", description: "Orders and tables updated." });
              }}
              className="rounded-xl h-10 border-border"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/admin/login");
              }}
              className="rounded-xl h-10 text-destructive hover:bg-destructive/10 text-xs font-bold"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              New / Pending
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-display font-bold text-amber-600">
                {pendingOrders.length}
              </span>
              <Bell className="w-6 h-6 text-amber-500/40" />
            </div>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              In Kitchen
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-display font-bold text-blue-600">
                {preparingOrders.length}
              </span>
              <ChefHat className="w-6 h-6 text-blue-500/40" />
            </div>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Active Tables
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-display font-bold text-emerald-600">
                {activeTablesCount} / {tables.length}
              </span>
              <Utensils className="w-6 h-6 text-emerald-500/40" />
            </div>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Total Revenue
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-display font-bold text-primary">
                ₹{totalRevenue.toFixed(0)}
              </span>
              <Coffee className="w-6 h-6 text-primary/40" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: REAL-TIME LIVE ORDERS                             */}
        {/* ======================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "preparing", label: "Preparing" },
                  { id: "ready", label: "Ready" },
                  { id: "completed", label: "Completed" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      statusFilter === s.id
                        ? "bg-foreground text-background font-bold shadow-sm"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Secondary Filters: Type, Table & Search */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={orderTypeFilter}
                  onChange={(e) => setOrderTypeFilter(e.target.value)}
                  className="bg-card border border-border text-xs rounded-xl h-10 px-3 font-semibold text-foreground focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="dine-in">Dine-in (Table)</option>
                  <option value="delivery">Delivery</option>
                </select>

                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="bg-card border border-border text-xs rounded-xl h-10 px-3 font-semibold text-foreground focus:outline-none"
                >
                  <option value="all">All Tables</option>
                  {tables.map((t) => (
                    <option key={t.id || t.tableNumber} value={t.tableNumber}>
                      Table #{t.tableNumber}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, #..."
                    className="pl-9 h-10 text-xs rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-card rounded-3xl p-16 text-center border border-border">
                <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-display text-2xl font-bold text-foreground">
                  No orders match this filter
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  When customers scan their table QR code and place an order, it appears here in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredOrders.map((order) => {
                    const statusStyles = {
                      pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
                      preparing: "bg-blue-500/15 text-blue-700 border-blue-500/30",
                      ready: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
                      completed: "bg-gray-500/15 text-gray-700 border-gray-500/30",
                      cancelled: "bg-red-500/15 text-red-700 border-red-500/30",
                    };

                    const elapsedMins = Math.round(
                      (Date.now() - new Date(order.createdAt).getTime()) / 60000
                    );

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card rounded-3xl border-2 border-border/80 shadow-md p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-200"
                      >
                        <div>
                          {/* Order Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-2xl font-black text-foreground">
                                  #{order.id}
                                </span>
                                {order.tableNumber ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center gap-1">
                                    <Utensils className="w-3.5 h-3.5" /> Table #{order.tableNumber}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                                    Delivery
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {elapsedMins <= 0 ? "Just now" : `${elapsedMins} mins ago`}
                              </p>
                            </div>

                            <span
                              className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                                statusStyles[order.status] || "bg-muted text-foreground"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          {/* USER LOGIN & PROFILE DETAILS */}
                          <div className="bg-muted/30 rounded-2xl p-3.5 mb-4 border border-border/60 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-primary" />
                                {order.customerName}
                              </span>
                              <span className="font-mono text-muted-foreground text-[11px]">
                                {order.mobileNumber}
                              </span>
                            </div>

                            {order.email && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                <Mail className="w-3 h-3" />
                                <span>{order.email}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                              <span>
                                Pay: <strong className="text-foreground">{order.paymentMode}</strong>
                              </span>
                              <span>
                                Total Orders:{" "}
                                <strong className="text-foreground">
                                  {order.totalCustomerOrdersCount || 1}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              <span>Items ({order.items?.length || 0})</span>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-primary hover:underline flex items-center gap-1 lowercase text-xs"
                              >
                                <Eye className="w-3 h-3" /> view details
                              </button>
                            </div>

                            <div className="bg-background rounded-xl p-3 border border-border/60 max-h-36 overflow-y-auto space-y-1.5 text-xs">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">
                                    <strong className="text-primary">{item.quantity}x</strong>{" "}
                                    {item.name}
                                  </span>
                                  <span className="text-muted-foreground font-mono">
                                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          {order.notes && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 mb-4">
                              <span className="font-bold text-[10px] uppercase block">
                                Kitchen Note:
                              </span>
                              {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Order Footer & Action Controls */}
                        <div>
                          <div className="flex items-center justify-between py-2 border-t border-border/80 mb-3 text-sm">
                            <span className="font-medium text-muted-foreground">Order Total:</span>
                            <span className="font-display text-xl font-bold text-primary">
                              ₹{Number(order.totalAmount).toFixed(2)}
                            </span>
                          </div>

                          {/* Status Actions */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {order.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, "preparing")}
                                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9"
                              >
                                <ChefHat className="w-3.5 h-3.5 mr-1" /> Start Prep
                              </Button>
                            )}

                            {order.status === "preparing" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, "ready")}
                                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9"
                              >
                                <Bell className="w-3.5 h-3.5 mr-1" /> Mark Ready
                              </Button>
                            )}

                            {order.status === "ready" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                                className="w-full rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs h-9"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                              </Button>
                            )}

                            {order.status !== "completed" && order.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendWhatsAppUpdate(order)}
                                className="w-full rounded-xl border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 font-bold text-xs h-9 flex items-center justify-center gap-1"
                              >
                                <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                              </Button>
                            )}
                          </div>

                          {/* Secondary options: cancel & delete */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                            {order.status !== "cancelled" && order.status !== "completed" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                className="text-destructive hover:underline text-[11px] font-semibold flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" /> Cancel Order
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-muted-foreground hover:text-destructive text-[11px] font-semibold flex items-center gap-1 ml-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ADMIN-ONLY TABLE QR CODE GENERATOR                */}
        {/* ======================================================== */}
        {activeTab === "tables" && (
          <div className="space-y-8">
            {/* Top QR Generation Console */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Exclusive Admin Authority</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                    Table QR Code Station
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                    Only administrators can generate and manage table QR codes. Print the branded stand cards and place them on each table so customers can scan and order directly from their seats.
                  </p>
                </div>

                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="rounded-xl border-border flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Batch QR Cards</span>
                </Button>
              </div>

              {/* Form to Generate New Table QR */}
              <form
                onSubmit={handleAddTable}
                className="p-5 bg-muted/30 rounded-2xl border border-border/60 flex flex-wrap items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">
                    Table Number:
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 13"
                    className="w-28 h-10 rounded-xl"
                    value={newTableNum}
                    onChange={(e) => setNewTableNum(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">
                    Seating Capacity:
                  </Label>
                  <select
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="bg-card border border-border text-xs rounded-xl h-10 px-3 font-semibold text-foreground focus:outline-none"
                  >
                    <option value={2}>2 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={6}>6 Guests</option>
                    <option value={8}>8 Guests</option>
                    <option value={10}>10 Guests</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isAddingTable || !newTableNum}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 px-5 flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate New Table QR</span>
                </Button>
              </form>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-8">
              {tables.map((table) => {
                const targetUrl = `${baseUrl}/table/${table.tableNumber}`;
                const isOccupied = table.activeOrdersCount > 0;

                return (
                  <div
                    key={table.id || table.tableNumber}
                    className="bg-card border-2 border-border/80 rounded-3xl p-6 text-center flex flex-col items-center justify-between shadow-sm hover:shadow-xl transition-all"
                  >
                    {/* Header Badge */}
                    <div className="w-full flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Bean & Brew
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOccupied
                            ? "bg-amber-500/20 text-amber-700 border border-amber-500/40"
                            : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
                        }`}
                      >
                        {isOccupied ? `Occupied (${table.activeOrdersCount} order)` : "Available"}
                      </span>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-stone-200 mb-4 transition-transform hover:scale-105 duration-200">
                      <QRCodeSVG
                        id={`qr-svg-table-${table.tableNumber}`}
                        value={targetUrl}
                        size={150}
                        level="H"
                        fgColor="#2b1a12"
                      />
                    </div>

                    <div className="mb-4">
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        Table #{table.tableNumber}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Capacity: {table.capacity || 4} Guests
                      </p>
                      {table.seatedCustomerName && (
                        <p className="text-[11px] text-primary font-semibold mt-1">
                          Current Diner: {table.seatedCustomerName}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-2 pt-3 border-t border-border print:hidden">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrintTableStand(table)}
                          className="w-full rounded-xl text-xs h-8 flex items-center justify-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Stand Card
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadSVG(table.tableNumber)}
                          className="w-full rounded-xl text-xs h-8 flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download
                        </Button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" /> Test Customer Scan
                        </a>

                        <button
                          onClick={() => handleDeleteTable(table.tableNumber)}
                          className="text-[11px] text-destructive hover:underline font-semibold flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ORDER DETAILS & CUSTOMER PROFILE                  */}
        {/* ======================================================== */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[550px] rounded-3xl bg-card border-border p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Order Inspection
                </span>
                <Badge variant="outline" className="text-xs font-bold uppercase">
                  {selectedOrder?.status}
                </Badge>
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-foreground">
                Order #{selectedOrder?.id}
                {selectedOrder?.tableNumber ? ` (Table #${selectedOrder.tableNumber})` : " (Delivery)"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Placed on {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4 pt-2">
                {/* Customer Login Details */}
                <div className="bg-muted/40 rounded-2xl p-4 border border-border/80 space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-primary text-[10px] block">
                    Customer Profile & Login Details
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Customer Name:</span>
                      <strong className="text-foreground">{selectedOrder.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Phone Number:</span>
                      <strong className="font-mono text-foreground">{selectedOrder.mobileNumber}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Email Address:</span>
                      <span className="text-foreground">{selectedOrder.email || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Payment Mode:</span>
                      <strong className="text-foreground">{selectedOrder.paymentMode}</strong>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Breakdown */}
                <div>
                  <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px] block mb-2">
                    Itemized Bill
                  </span>
                  <div className="bg-background rounded-2xl border border-border/70 p-4 space-y-2 text-xs">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                        <span className="font-medium">
                          <strong className="text-primary">{item.quantity}x</strong> {item.name}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          ₹{(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 text-sm font-bold border-t border-border">
                      <span>Total Amount:</span>
                      <span className="text-primary font-display text-lg">
                        ₹{Number(selectedOrder.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900">
                    <span className="font-bold uppercase text-[10px] block">Kitchen Note:</span>
                    {selectedOrder.notes}
                  </div>
                )}

                {/* WhatsApp Update CTA */}
                <Button
                  onClick={() => handleSendWhatsAppUpdate(selectedOrder)}
                  className="w-full rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs h-10 flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>Send WhatsApp Status Notification</span>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ======================================================== */}
        {/* MODAL: PRINTABLE SINGLE TABLE STAND CARD                 */}
        {/* ======================================================== */}
        <Dialog open={!!printTableStand} onOpenChange={() => setPrintTableStand(null)}>
          <DialogContent className="sm:max-w-[420px] rounded-3xl bg-card border-border p-6 text-center">
            {printTableStand && (
              <div id="printable-stand-card" className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="font-display text-2xl font-bold text-foreground">Bean & Brew Cafe</h3>
                  <p className="text-xs text-muted-foreground">Fresh Coffee & Artisanal Bites</p>
                </div>

                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary font-display font-black text-2xl">
                  #{printTableStand.tableNumber}
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-md inline-block">
                  <QRCodeSVG
                    value={`${baseUrl}/table/${printTableStand.tableNumber}`}
                    size={180}
                    level="H"
                    fgColor="#2b1a12"
                  />
                </div>

                <div>
                  <h4 className="font-display text-xl font-bold">Table #{printTableStand.tableNumber}</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    Point your phone camera to browse the menu, customize your order, and receive service right at your table.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 print:hidden">
                  <Button
                    variant="outline"
                    className="w-1/2 rounded-xl"
                    onClick={() => setPrintTableStand(null)}
                  >
                    Close
                  </Button>
                  <Button
                    className="w-1/2 rounded-xl bg-primary text-primary-foreground font-bold"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4 mr-1.5" /> Print Card
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
