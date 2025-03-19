import React from "react";

interface ProgressInputProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

const ProgressInput = ({ value = 0, onChange, disabled }: ProgressInputProps) => {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = Number(e.target.value);
        if (newValue < 0) newValue = 0;
        if (newValue > 100) newValue = 100;
        onChange(newValue);
    };

    return (
        <div className="flex items-center space-x-2 w-auto justify-end">
            <div className="relative w-auto">
                <div className="relative w-48 h-6 bg-gray-200 rounded-md overflow-hidden">
                    <div
                        className="h-full bg-cyan-700 transition-all duration-200 flex items-center"
                        style={{ width: `${value}%` }}
                    >
                        {value > 70 && (
                            <span className="text-white font-semibold text-sm w-full text-center">{value}%</span>
                        )}
                    </div>
                    {value < 70 && (
                        <span
                            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-700 font-semibold text-sm"
                        >
                            {value}%
                        </span>
                    )}
                </div>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={handleSliderChange}
                    disabled={disabled}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );
};

export default ProgressInput;