import { useState } from 'react';

interface FormulaEditorProps {
  onFormulaChange: (formula: string) => void;
}

export const FormulaEditor = ({ onFormulaChange }: FormulaEditorProps) => {
  const [formula, setFormula] = useState<string>("");

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormula = e.target.value;
    setFormula(newFormula);
    onFormulaChange(newFormula); // Pass the new formula back to parent
  };

  return (
    <div className="p-4 bg-white border rounded-md shadow-md">
      <h3 className="text-lg font-medium text-gray-800">Edit CNA Incentive Formula</h3>
      <p className="mt-2 text-sm text-gray-600">Update the formula used to calculate the CNA Incentive.</p>
      <div className="mt-4">
        <input
          type="text"
          value={formula}
          onChange={handleFormulaChange}
          className="w-full p-2 border rounded-md"
          placeholder="Enter formula for CNA Incentive"
        />
      </div>
    </div>
  );
};
