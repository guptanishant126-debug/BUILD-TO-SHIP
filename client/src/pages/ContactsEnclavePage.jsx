import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import VoiceEnrollmentWizard from '../components/VoiceEnrollmentWizard';
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Mic,
  KeyRound,
  Lock,
  Phone,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const ContactsEnclavePage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [enrollingContact, setEnrollingContact] = useState(null);
  const [challengingContact, setChallengingContact] = useState(null);

  // New Contact Form State
  const [newContact, setNewContact] = useState({
    full_name: '',
    relationship: 'CHILD',
    phone_number: ''
  });

  // New Challenge Form State
  const [newChallenge, setNewChallenge] = useState({
    question_prompt: '',
    secret_answer: '',
    hint: ''
  });

  const fetchContacts = async () => {
    try {
      const res = await axiosInstance.get('/contacts');
      if (res.data.success) {
        setContacts(res.data.contacts);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/contacts', newContact);
      if (res.data.success) {
        setShowAddModal(false);
        setNewContact({ full_name: '', relationship: 'CHILD', phone_number: '' });
        fetchContacts();
      }
    } catch (err) {
      console.error('Failed to create contact:', err);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact and purge their biometric vectors from the Enclave?')) return;
    try {
      await axiosInstance.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    }
  };

  const handleAddChallenge = async (e) => {
    e.preventDefault();
    if (!challengingContact) return;
    try {
      const res = await axiosInstance.post(`/contacts/${challengingContact.id}/challenges`, newChallenge);
      if (res.data.success) {
        setChallengingContact(null);
        setNewChallenge({ question_prompt: '', secret_answer: '', hint: '' });
        fetchContacts();
      }
    } catch (err) {
      console.error('Failed to add challenge:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Zero-Knowledge Biometric Enclave
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Personalized Trusted Contacts</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Store unalterable acoustic baselines and shared private memory secrets for family members, doctors, and financial reps.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trusted Contact</span>
        </button>
      </div>

      {/* Voice Enrollment Wizard Modal */}
      {enrollingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <VoiceEnrollmentWizard
            contact={enrollingContact}
            onEnrollmentComplete={() => {
              setEnrollingContact(null);
              fetchContacts();
            }}
            onCancel={() => setEnrollingContact(null)}
          />
        </div>
      )}

      {/* Secret Challenge Configurator Modal */}
      {challengingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Configure Shared Secret</h3>
              </div>
              <button onClick={() => setChallengingContact(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Private Challenge Question (Known only to you and caller)
                </label>
                <input
                  type="text"
                  required
                  value={newChallenge.question_prompt}
                  onChange={(e) => setNewChallenge({ ...newChallenge, question_prompt: e.target.value })}
                  placeholder="Where did we spend Christmas in 2022?"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secret Answer (Hashed with bcrypt upon storage)
                </label>
                <input
                  type="password"
                  required
                  value={newChallenge.secret_answer}
                  onChange={(e) => setNewChallenge({ ...newChallenge, secret_answer: e.target.value })}
                  placeholder="Lake Tahoe cabin"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Private Memory Hint (Displayed to you on screen during a call)
                </label>
                <input
                  type="text"
                  value={newChallenge.hint}
                  onChange={(e) => setNewChallenge({ ...newChallenge, hint: e.target.value })}
                  placeholder="Cabin by the lake with uncle Bob's dog"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChallengingContact(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Save Secret
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">Add Contact to Enclave</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContact.full_name}
                  onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })}
                  placeholder="Sarah Vance"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship</label>
                <select
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="CHILD">Child / Grandchild</option>
                  <option value="PARENT">Parent / Grandparent</option>
                  <option value="SPOUSE">Spouse / Partner</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="FRIEND">Friend</option>
                  <option value="BANK_OFFICIAL">Bank / Financial Representative</option>
                  <option value="COLLEAGUE">Work Colleague</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (E.164)</label>
                <input
                  type="text"
                  value={newContact.phone_number}
                  onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })}
                  placeholder="+1 (555) 345-6789"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {c.relationship}
                </span>
                <button
                  onClick={() => handleDeleteContact(c.id)}
                  title="Purge contact and biometric baseline from enclave"
                  className="p-1 rounded text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-white text-base mb-1">{c.full_name}</h3>
              <p className="text-slate-400 text-xs font-mono flex items-center space-x-1 mb-4">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>{c.phone_number || 'No phone registered'}</span>
              </p>

              {/* Biometric Status */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Voice Baseline:</span>
                  {c.is_voice_enrolled ? (
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Calibrated</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[11px] font-semibold">Not Enrolled</span>
                  )}
                </div>

                {c.is_voice_enrolled && (
                  <div className="text-[11px] font-mono text-slate-400 grid grid-cols-2 gap-1 pt-1 border-t border-slate-800/80">
                    <div>Pitch: <strong className="text-cyan-300">{c.pitch_mean_hz || 224.5} Hz</strong></div>
                    <div>Centroid: <strong className="text-cyan-300">{c.spectral_centroid_mean || 1820} Hz</strong></div>
                  </div>
                )}
              </div>

              {/* Challenges Configured */}
              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Shared Verification Secrets: ({c.challenges?.length || 0})
                </span>
                {c.challenges?.length > 0 ? (
                  <div className="text-xs text-slate-300 italic p-2 rounded-lg bg-slate-950/40 border border-slate-800 line-clamp-2">
                    "{c.challenges[0].question_prompt}"
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No secret challenge configured yet.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setEnrollingContact(c)}
                className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{c.is_voice_enrolled ? 'Re-Enroll Voice' : 'Enroll Voice'}</span>
              </button>

              <button
                onClick={() => setChallengingContact(c)}
                className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Add Secret</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default ContactsEnclavePage;

