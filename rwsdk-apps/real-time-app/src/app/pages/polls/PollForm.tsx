"use client";

import { useState, useTransition } from "react";
import { createPoll } from "./functions";

type Choice = {
  text: string;
  color: string;
};

export function PollForm() {
  const [title, setTitle] = useState("");
  const [choices, setChoices] = useState<Choice[]>([
    { text: "", color: "#007cba" },
    { text: "", color: "#dc3545" }
  ]);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState("");

  const addChoice = () => {
    const colors = ["#28a745", "#ffc107", "#6f42c1", "#fd7e14", "#e83e8c", "#20c997"];
    const nextColor = colors[choices.length % colors.length];
    setChoices([...choices, { text: "", color: nextColor }]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const updateChoice = (index: number, field: keyof Choice, value: string) => {
    const updated = choices.map((choice, i) => 
      i === index ? { ...choice, [field]: value } : choice
    );
    setChoices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setResult("Please enter a poll title");
      return;
    }

    const validChoices = choices.filter(c => c.text.trim());
    if (validChoices.length < 2) {
      setResult("Please enter at least 2 choices");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/poll/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            choices: validChoices
          })
        });

        if (response.ok) {
          setTitle("");
          setChoices([
            { text: "", color: "#007cba" },
            { text: "", color: "#dc3545" }
          ]);
          setResult("Poll created successfully!");
          
          // Reload page to show new poll in the list
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setResult("Failed to create poll");
        }
      } catch (error) {
        setResult("Error creating poll");
      }
    });
  };

  return (
    <div className="poll-form-container">
      <h2 className="poll-form-title">Create New Poll</h2>

      <form onSubmit={handleSubmit}>
        <div className="poll-form-section">
          <label className="poll-form-label">
            Poll Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What would you like to ask?"
            className="poll-form-input"
          />
        </div>

        <div className="poll-form-section">
          <label className="poll-form-label">
            Choices:
          </label>
          {choices.map((choice, index) => (
            <div key={index} className="poll-form-input-flex">
              <input
                type="text"
                value={choice.text}
                onChange={(e) => updateChoice(index, "text", e.target.value)}
                placeholder={`Choice ${index + 1}`}
                className="poll-form-input-text"
              />
              <input
                type="color"
                value={choice.color}
                onChange={(e) => updateChoice(index, "color", e.target.value)}
                className="poll-form-color-input"
              />
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                  className="poll-form-button-danger"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addChoice}
            disabled={choices.length >= 8}
            className={`poll-form-button-secondary ${choices.length >= 8 ? 'disabled' : ''}`}
          >
            Add Choice ({choices.length}/8)
          </button>
        </div>

        <div className="poll-form-actions">
          <button
            type="submit"
            disabled={isPending}
            className={`poll-form-button-primary ${isPending ? 'disabled' : ''}`}
          >
            {isPending ? "Creating..." : "Create Poll"}
          </button>

          {result && (
            <span className={`poll-form-result ${result.includes("successfully") ? 'success' : 'error'}`}>
              {result}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}