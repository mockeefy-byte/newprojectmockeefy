import { X, Code as CodeIcon, Play, Copy, Download, Settings } from 'lucide-react';
import React from 'react';

interface CodeEditorPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CodeEditorPanel = ({ isOpen, onClose }: CodeEditorPanelProps) => {
    // This component is mostly UI for now, logic can be added later (Monaco Editor / CodeMirror)

    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-300 border-r border-[#333] shadow-2xl">
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-4 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-2">
                    <CodeIcon size={18} className="text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live Editor</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-[#333] rounded text-green-500" title="Run Code">
                        <Play size={16} />
                    </button>
                    <div className="h-4 w-px bg-[#333] mx-1"></div>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Editor Area (Mock) */}
            <div className="flex-1 relative font-mono text-sm">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end pt-4 pr-2 text-gray-600 select-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                </div>
                <div className="absolute left-12 top-0 right-0 bottom-0 p-4 outline-none whitespace-pre overflow-auto text-gray-300 leading-6">
                    <span className="text-purple-400">function</span> <span className="text-yellow-300">solveProblem</span>(input) {'{'}
                    {'\n'}  <span className="text-gray-500">// Write your solution here...</span>
                    {'\n'}  <span className="text-purple-400">const</span> result = input * 2;
                    {'\n'}  <span className="text-purple-400">return</span> result;
                    {'\n'}{'}'}
                    {'\n'}
                    {'\n'}<span className="text-gray-500">// Output will appear below</span>
                </div>
            </div>

            {/* Output / Console */}
            <div className="h-1/3 border-t border-[#333] bg-[#1e1e1e] flex flex-col">
                <div className="h-8 px-4 flex items-center justify-between bg-[#252526] border-b border-[#333]">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Console / Output</span>
                    <button className="text-[10px] text-gray-500 hover:text-gray-300">Clear</button>
                </div>
                <div className="flex-1 p-4 font-mono text-xs text-gray-400 overflow-auto">
                    {/* Mock Output */}
                    <div className="mb-1 text-green-400">{'>'} Code compiled successfully</div>
                    <div className="mb-1">Running tests...</div>
                    <div className="text-gray-500 italic">No output yet. Click 'Run' to execute.</div>
                </div>
            </div>
        </div>
    );
};
