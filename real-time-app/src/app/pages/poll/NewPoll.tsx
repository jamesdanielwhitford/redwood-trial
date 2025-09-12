"use client";

import { useState } from "react";
import { createPoll } from "./functions";

type Choice = {
  text: string;
  emoji: string;
  color: string;
};

export const NewPoll = () => {
  const [title, setTitle] = useState("");
  const [choices, setChoices] = useState<Choice[]>([
    { text: "", emoji: "🔴", color: "#FF6B6B" },
    { text: "", emoji: "🔵", color: "#4ECDC4" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addChoice = () => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
    const emojis = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];
    const colorIndex = choices.length % colors.length;
    
    setChoices([
      ...choices,
      { text: "", emoji: emojis[colorIndex], color: colors[colorIndex] }
    ]);
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const updateChoice = (index: number, field: keyof Choice, value: string) => {
    const newChoices = [...choices];
    newChoices[index][field] = value;
    setChoices(newChoices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a poll title");
      return;
    }
    
    const validChoices = choices.filter(choice => choice.text.trim());
    if (validChoices.length < 2) {
      alert("Please add at least 2 choices");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("choices", JSON.stringify(validChoices));
      
      const poll = await createPoll(formData);
      
      // Redirect to the new poll
      window.location.href = `/poll/${poll.id}`;
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "2rem", 
      fontFamily: "system-ui, -apple-system, sans-serif" 
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center", color: "#333" }}>
        Create New Poll
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}>
            Poll Question
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question?"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              border: "2px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#4ECDC4"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "1rem", 
            fontWeight: "bold", 
            color: "#555" 
          }}>
            Answer Choices
          </label>
          
          {choices.map((choice, index) => (
            <div key={index} style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "1rem",
              padding: "1rem",
              border: "1px solid #eee",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9"
            }}>
              <input
                type="text"
                value={choice.emoji}
                onChange={(e) => updateChoice(index, "emoji", e.target.value)}
                style={{
                  width: "50px",
                  padding: "0.5rem",
                  fontSize: "1.2rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginRight: "0.5rem",
                  textAlign: "center"
                }}
                placeholder="😊"
                disabled={isSubmitting}
              />
              
              <input
                type="text"
                value={choice.text}
                onChange={(e) => updateChoice(index, "text", e.target.value)}
                placeholder={`Choice ${index + 1}`}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  fontSize: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginRight: "0.5rem"
                }}
                disabled={isSubmitting}
              />
              
              <input
                type="color"
                value={choice.color}
                onChange={(e) => updateChoice(index, "color", e.target.value)}
                style={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginRight: "0.5rem",
                  cursor: "pointer"
                }}
                disabled={isSubmitting}
              />
              
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#ff4757",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addChoice}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#f1f2f6",
              color: "#333",
              border: "2px dashed #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              fontSize: "1rem"
            }}
            disabled={isSubmitting}
          >
            + Add Choice
          </button>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="button"
            onClick={() => window.location.href = "/"}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "#f1f2f6",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem"
            }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            style={{
              flex: 2,
              padding: "1rem",
              backgroundColor: isSubmitting ? "#ccc" : "#4ECDC4",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "bold"
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Poll..." : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  );
};