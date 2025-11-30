import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Users, BookOpen, GraduationCap, Settings, Calendar, AlertCircle, CheckCircle, RefreshCw, ChevronLeft } from 'lucide-react';
import { runBacktrackingAlgorithm } from './scheduler';

const TimetableApp = () => {
  const [activeTab, setActiveTab] = useState('faculty');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  
  const [faculty, setFaculty] = useState([
    { id: 1, name: 'Suresh V', short: 'SV', color: '#ffebee', maxHours: 16 },
    { id: 2, name: 'Sojan Jose', short: 'SJ', color: '#e0f7ff', maxHours: 16 },
    { id: 3, name: 'Rasmi AR', short: 'ARR', color: '#e8f5e9', maxHours: 16 }
  ]);

  const [classes, setClasses] = useState([
    { id: 1, name: 'BSc Botany S6', short: 'S6' },
    { id: 2, name: 'MSc Botany S2', short: 'PG2' }
  ]);

  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Genetics', code: 'BOT101', type: 'Theory' },
    { id: 2, name: 'Plant Physiology', code: 'BOT102', type: 'Theory' },
    { id: 3, name: 'Practical Lab 1', code: 'LAB1', type: 'Practical' }
  ]);

  const [workload, setWorkload] = useState([]);

  const [constraints, setConstraints] = useState({
    maxConsecutive: 2,
    maxDailyHours: 4,
    forceFreeHourAfterConsecutive: true,
    ensureAllDaysEngaged: true,
    distributeWorkloadEvenly: true,
    allowJointClasses: true
  });

  const [finalSchedule, setFinalSchedule] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('timetable_builder_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFaculty(parsed.faculty || []);
        setClasses(parsed.classes || []);
        setSubjects(parsed.subjects || []);
        setWorkload(parsed.workload || []);
        setConstraints(parsed.constraints || {});
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  const saveData = () => {
    const data = { faculty, classes, subjects, workload, constraints };
    localStorage.setItem('timetable_builder_data', JSON.stringify(data));
    alert('Data saved successfully!');
  };

  const generateId = () => Math.floor(Math.random() * 100000);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setActiveTab('results'); 

    setTimeout(() => {
      try {
        const result = runBacktrackingAlgorithm(workload, classes, subjects, faculty, constraints);
        setFinalSchedule(result);
      } catch (err) {
        setGenerationError(err.message);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const FacultyTab = () => {
    const [newName, setNewName] = useState('');
    const [newShort, setNewShort] = useState('');

    const addFaculty = () => {
      if (!newName || !newShort) return;
      setFaculty([...faculty, { id: generateId(), name: newName, short: newShort, color: '#f3f4f6', maxHours: 16 }]);
      setNewName('');
      setNewShort('');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center"><Users className="w-5 h-5 mr-2" /> Add Faculty</h3>
          <div className="flex gap-4">
            <input className="flex-1 p-2 border rounded" placeholder="Full Name (e.g. Suresh V)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="w-32 p-2 border rounded" placeholder="Abbr (SV)" value={newShort} onChange={(e) => setNewShort(e.target.value.toUpperCase())} />
            <button onClick={addFaculty} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"><Plus className="w-4 h-4 mr-1" /> Add</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculty.map(f => (
            <div key={f.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{f.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">{f.short}</span>
                  <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: f.color}}></div>
                </div>
              </div>
              <button onClick={() => setFaculty(faculty.filter(x => x.id !== f.id))} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const EntitiesTab = () => {
    const [newItem, setNewItem] = useState({ name: '', short: '' });
    const [type, setType] = useState('class');

    const addItem = () => {
      if (!newItem.name || !newItem.short) return;
      if (type === 'class') {
        setClasses([...classes, { id: generateId(), ...newItem }]);
      } else {
        setSubjects([...subjects, { id: generateId(), ...newItem, type: 'Theory' }]);
      }
      setNewItem({ name: '', short: '' });
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2" /> Classes</h3>
            <div className="flex gap-2 mb-4">
              <input className="flex-1 p-2 border rounded" placeholder="Class Name" value={type === 'class' ? newItem.name : ''} onChange={e => { setType('class'); setNewItem({...newItem, name: e.target.value})}} />
              <input className="w-24 p-2 border rounded" placeholder="Short" value={type === 'class' ? newItem.short : ''} onChange={e => { setType('class'); setNewItem({...newItem, short: e.target.value})}} />
              <button onClick={addItem} className="bg-blue-600 text-white px-3 rounded"><Plus className="w-5 h-5" /></button>
            </div>
            <ul className="divide-y">{classes.map(c => (<li key={c.id} className="py-2 flex justify-between items-center"><span>{c.name} ({c.short})</span><button onClick={() => setClasses(classes.filter(x => x.id !== c.id))} className="text-red-400"><Trash2 className="w-4 h-4" /></button></li>))}</ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center"><BookOpen className="w-5 h-5 mr-2" /> Subjects</h3>
            <div className="flex gap-2 mb-4">
              <input className="flex-1 p-2 border rounded" placeholder="Subject Name" value={type === 'subject' ? newItem.name : ''} onChange={e => { setType('subject'); setNewItem({...newItem, name: e.target.value})}} />
              <input className="w-24 p-2 border rounded" placeholder="Code" value={type === 'subject' ? newItem.short : ''} onChange={e => { setType('subject'); setNewItem({...newItem, short: e.target.value})}} />
              <button onClick={addItem} className="bg-blue-600 text-white px-3 rounded"><Plus className="w-5 h-5" /></button>
            </div>
            <ul className="divide-y h-64 overflow-y-auto">{subjects.map(s => (<li key={s.id} className="py-2 flex justify-between items-center"><span>{s.name} ({s.short})</span><button onClick={() => setSubjects(subjects.filter(x => x.id !== s.id))} className="text-red-400"><Trash2 className="w-4 h-4" /></button></li>))}</ul>
          </div>
        </div>
      </div>
    );
  };

  const WorkloadTab = () => {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
    const [form, setForm] = useState({ subjectId: '', teacherId: '', assistantId: '', hasAssistant: false, hours: 1 });

    const addWorkload = () => {
      if (!selectedClass || !form.subjectId || !form.teacherId) return;
      const newEntry = { id: generateId(), classId: parseInt(selectedClass), subjectId: parseInt(form.subjectId), teacherId: parseInt(form.teacherId), assistantId: form.hasAssistant ? parseInt(form.assistantId) : null, hoursPerWeek: parseInt(form.hours), type: form.hasAssistant ? 'Joint' : 'Normal' };
      setWorkload([...workload, newEntry]);
      setForm({ ...form, subjectId: '', hours: 1 }); 
    };

    const currentClassWorkload = workload.filter(w => w.classId == selectedClass);
    const totalHours = currentClassWorkload.reduce((acc, curr) => acc + curr.hoursPerWeek, 0);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-4"><span className="font-semibold text-blue-800">Select Class:</span><select className="p-2 border rounded min-w-[200px]" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="text-blue-800 font-mono">Load: <strong>{totalHours}</strong> / 25 Hrs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold mb-4 text-gray-700">Assign Subject & Faculty</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-1"><label className="text-xs font-semibold text-gray-500 mb-1 block">Subject</label><select className="w-full p-2 border rounded" value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})}><option value="">Select Subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="lg:col-span-1"><label className="text-xs font-semibold text-gray-500 mb-1 block">Faculty</label><select className="w-full p-2 border rounded" value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})}><option value="">Select Teacher</option>{faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
            <div className="lg:col-span-1"><div className="flex items-center mb-1 gap-2"><input type="checkbox" id="hasAsst" checked={form.hasAssistant} onChange={e => setForm({...form, hasAssistant: e.target.checked})} /><label htmlFor="hasAsst" className="text-xs font-semibold text-gray-500 cursor-pointer">Has Asst?</label></div><select className="w-full p-2 border rounded disabled:bg-gray-100" disabled={!form.hasAssistant} value={form.assistantId} onChange={e => setForm({...form, assistantId: e.target.value})}><option value="">-- None --</option>{faculty.filter(f => f.id != form.teacherId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
            <div className="lg:col-span-1"><label className="text-xs font-semibold text-gray-500 mb-1 block">Hrs/Wk</label><input type="number" min="1" max="10" className="w-full p-2 border rounded" value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} /></div>
            <button onClick={addWorkload} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 flex justify-center items-center h-[42px]"><Plus className="w-5 h-5 mr-1" /> Add</button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm"><thead className="bg-gray-50 border-b"><tr><th className="p-4">Subject</th><th className="p-4">Faculty</th><th className="p-4">Load</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y">{currentClassWorkload.length === 0 ? (<tr><td colSpan="4" className="p-8 text-center text-gray-400">No workload assigned.</td></tr>) : (currentClassWorkload.map(w => { const sub = subjects.find(s => s.id === w.subjectId); const teacher = faculty.find(f => f.id === w.teacherId); const asst = w.assistantId ? faculty.find(f => f.id === w.assistantId) : null; return (<tr key={w.id} className="hover:bg-gray-50"><td className="p-4 font-medium">{sub?.name}</td><td className="p-4"><div className="flex items-center gap-2"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{teacher?.short}</span>{asst && (<><span className="text-gray-400">+</span><span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">{asst.short}</span></>)}</div></td><td className="p-4 font-bold">{w.hoursPerWeek} Hrs</td><td className="p-4 text-right"><button onClick={() => setWorkload(workload.filter(x => x.id !== w.id))} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td></tr>); }))}</tbody></table>
        </div>
      </div>
    );
  };

  const ConstraintsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><AlertCircle className="w-5 h-5 mr-2" /> Hard Constraints</h3>
        <ul className="space-y-3">
          <li className="flex items-center text-gray-700"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> No faculty in two places at once</li>
          <li className="flex items-center text-gray-700"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> No class has two subjects at once</li>
          <li className="flex items-center text-gray-700"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Assistant must be free during Joint Classes</li>
        </ul>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><Settings className="w-5 h-5 mr-2" /> Settings</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Consecutive Hours</label><input type="number" value={constraints.maxConsecutive} onChange={e => setConstraints({...constraints, maxConsecutive: parseInt(e.target.value)})} className="w-full p-2 border rounded" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Daily Hours per Faculty</label><input type="number" value={constraints.maxDailyHours} onChange={e => setConstraints({...constraints, maxDailyHours: parseInt(e.target.value)})} className="w-full p-2 border rounded" /></div>
        </div>
      </div>
    </div>
  );

  const ResultsTab = () => {
    if (isGenerating) return <div className="flex flex-col items-center justify-center h-96"><RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" /><h2 className="text-xl font-bold text-gray-800">Generating Timetable...</h2></div>;
    if (generationError) return <div className="bg-red-50 p-8 rounded-lg border border-red-200 text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-bold text-red-800 mb-2">Failed</h3><p className="text-red-600 mb-4">{generationError}</p><button onClick={() => setActiveTab('workload')} className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded font-medium">Adjust Workload</button></div>;
    if (!finalSchedule) return <div className="text-center p-12 text-gray-400"><p>Click "Generate Timetable" to produce the schedule.</p></div>;

    const DAYS_MAP = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    return (
      <div className="space-y-8">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b"><h3 className="text-lg font-bold text-gray-800">{cls.name}</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-sm border-collapse">
                <thead><tr><th className="p-3 border bg-gray-100 w-24">Day</th>{[1,2,3,4,5].map(p => <th key={p} className="p-3 border bg-gray-100">P{p}</th>)}</tr></thead>
                <tbody>{DAYS_MAP.map((day, dayIdx) => (<tr key={day}><td className="p-3 border font-semibold bg-gray-50">{day}</td>{[1,2,3,4,5].map(period => { const slot = finalSchedule[cls.id][dayIdx][period]; if (!slot) return <td key={period} className="p-3 border text-gray-300">-</td>; const sub = subjects.find(s => s.id === slot.subjectId); const teacher = faculty.find(f => f.id === slot.teacherId); const asst = slot.assistantId ? faculty.find(f => f.id === slot.assistantId) : null; return (<td key={period} className="p-3 border"><div className="font-bold text-gray-800">{sub?.short}</div><div className="text-xs mt-1 space-x-1"><span style={{backgroundColor: teacher?.color}} className="px-1.5 py-0.5 rounded border border-gray-200">{teacher?.short}</span>{asst && (<span style={{backgroundColor: asst.color}} className="px-1.5 py-0.5 rounded border border-gray-200">{asst.short}</span>)}</div></td>); })}</tr>))}</tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2"><Calendar className="w-6 h-6 text-blue-600" /><h1 className="text-xl font-bold text-gray-800 hidden md:block">Timetable Architect</h1></div>
          <div className="flex items-center space-x-2">
            {activeTab === 'results' && <button onClick={() => setActiveTab('workload')} className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded flex items-center text-sm"><ChevronLeft className="w-4 h-4 mr-1" /> Edit</button>}
            <button onClick={saveData} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded flex items-center text-sm font-medium"><Save className="w-4 h-4 mr-1" /> Save</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-2 overflow-x-auto"><div className="flex space-x-1">{[{ id: 'faculty', label: '1. Faculty', icon: Users }, { id: 'entities', label: '2. Classes', icon: GraduationCap }, { id: 'workload', label: '3. Workload', icon: BookOpen }, { id: 'constraints', label: '4. Rules', icon: Settings }, { id: 'results', label: '5. Results', icon: Calendar, disabled: !finalSchedule }].map(tab => (<button key={tab.id} disabled={tab.disabled && activeTab !== 'results'} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : tab.disabled ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}><tab.icon className="w-4 h-4 mr-2" />{tab.label}</button>))}</div></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'faculty' && <FacultyTab />}
        {activeTab === 'entities' && <EntitiesTab />}
        {activeTab === 'workload' && <WorkloadTab />}
        {activeTab === 'constraints' && <ConstraintsTab />}
        {activeTab === 'results' && <ResultsTab />}
      </div>
      {activeTab !== 'results' && (<div className="fixed bottom-8 right-8 z-50"><button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center transition-transform hover:scale-105" onClick={handleGenerate}><Calendar className="w-5 h-5 mr-2" /> Generate Timetable</button></div>)}
    </div>
  );
};

export default TimetableApp;
