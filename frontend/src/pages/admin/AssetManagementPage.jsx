import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { assetsApi } from '../../api/resources.api';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AssetManagementPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Asset Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'web-app',
    environment: 'production',
    criticality: 3,
    internetFacing: false,
    dataSensitivity: 3,
    owner: '',
    businessUnit: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await assetsApi.getAssets();
      setAssets(res.data || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError(err.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const openCreateModal = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      type: 'web-app',
      environment: 'production',
      criticality: 3,
      internetFacing: false,
      dataSensitivity: 3,
      owner: '',
      businessUnit: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      environment: asset.environment,
      criticality: asset.criticality,
      internetFacing: asset.internetFacing,
      dataSensitivity: asset.dataSensitivity,
      owner: asset.owner || '',
      businessUnit: asset.businessUnit || '',
      description: asset.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingAsset) {
        await assetsApi.updateAsset(editingAsset._id, formData);
        setSuccessMsg(`Asset ${formData.name} updated successfully.`);
      } else {
        await assetsApi.createAsset(formData);
        setSuccessMsg(`Asset ${formData.name} created successfully.`);
      }
      setIsModalOpen(false);
      fetchAssets();
    } catch (err) {
      setError(err.message || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (assetId, assetName) => {
    if (!window.confirm(`Are you sure you want to delete asset "${assetName}"?`)) return;
    try {
      await assetsApi.deleteAsset(assetId);
      setSuccessMsg(`Asset "${assetName}" deleted.`);
      fetchAssets();
    } catch (err) {
      setError(err.message || 'Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
                         a.owner?.toLowerCase().includes(search.toLowerCase());
    const matchEnv = !envFilter || a.environment === envFilter;
    return matchSearch && matchEnv;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-7 h-7 text-cyan-400" />
            Asset Inventory & Context Architecture
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage organizational assets, exposure classifications, and business criticality ratings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" /> Register New Asset
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search assets by name or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
            <option value="test">Test</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" message="Loading assets..." />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No assets match current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Asset Name</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Environment</th>
                  <th className="py-3 px-4 font-semibold">Criticality</th>
                  <th className="py-3 px-4 font-semibold">Exposure</th>
                  <th className="py-3 px-4 font-semibold">Data Sensitivity</th>
                  <th className="py-3 px-4 font-semibold">Owner</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-white">
                      {asset.name}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300 capitalize">
                      {asset.type.replace('-', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                        asset.environment === 'production'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : asset.environment === 'staging'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {asset.environment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="font-bold text-amber-400">{asset.criticality}</span>
                      <span className="text-slate-500 text-xs"> / 5</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      {asset.internetFacing ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3" /> Internal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-indigo-400 font-bold">
                      {asset.dataSensitivity} / 5
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {asset.owner || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(asset)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit Asset"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset._id, asset.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                {editingAsset ? 'Edit Asset Profile' : 'Register New Asset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Core Payment Gateway API"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="web-app">Web App</option>
                    <option value="api">API Service</option>
                    <option value="server">Server / Host</option>
                    <option value="database">Database</option>
                    <option value="network-device">Network Device</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="test">Test / Sandbox</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Criticality: <span className="text-amber-400 font-bold">{formData.criticality}/5</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: parseInt(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data Sensitivity: <span className="text-indigo-400 font-bold">{formData.dataSensitivity}/5</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.dataSensitivity}
                    onChange={(e) => setFormData({ ...formData, dataSensitivity: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.internetFacing}
                    onChange={(e) => setFormData({ ...formData, internetFacing: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-rose-500"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    Internet Facing (Directly exposed to public internet)
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="Engineering Lead"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Unit</label>
                  <input
                    type="text"
                    value={formData.businessUnit}
                    onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                    placeholder="Fintech Services"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                >
                  {saving ? <LoadingSpinner size="sm" /> : editingAsset ? 'Save Changes' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
