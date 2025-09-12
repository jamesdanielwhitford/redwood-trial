import { useState } from "react";

type Choice = {
  text: string;
  color: string;
};

type PollFormProps = {
  onPollCreated: () => void;
};

export function PollForm({ onPollCreated }: PollFormProps) {
  const [title, setTitle] = useState("");
  const [choices, setChoices] = useState<Choice[]>([
    { text: "", color: "#007cba" },
    { text: "", color: "#dc3545" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    setIsSubmitting(true);
    setResult("");

    try {
      const response = await fetch("/api/polls", {
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
        onPollCreated();
      } else {
        setResult("Failed to create poll");
      }
    } catch (error) {
      setResult("Error creating poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "1.5rem",
      background: "white",
      marginBottom: "2rem"
    }}>
      <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Create New Poll</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "500" 
          }}>
            Poll Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What would you like to ask?"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            fontWeight: "500" 
          }}>
            Choices:
          </label>
          {choices.map((choice, index) => (
            <div key={index} style={{ 
              display: "flex", 
              gap: "0.5rem", 
              marginBottom: "0.5rem",
              alignItems: "center"
            }}>
              <input
                type="text"
                value={choice.text}
                onChange={(e) => updateChoice(index, "text", e.target.value)}
                placeholder={`Choice ${index + 1}`}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px"
                }}
              />
              <input
                type="color"
                value={choice.color}
                onChange={(e) => updateChoice(index, "color", e.target.value)}
                style={{
                  width: "50px",
                  height: "38px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              />
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
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
            style={{
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              marginTop: "0.5rem",
              opacity: choices.length >= 8 ? 0.6 : 1
            }}
          >
            Add Choice ({choices.length}/8)
          </button>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: "#007cba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.75rem 1.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? "Creating..." : "Create Poll"}
          </button>
          
          {result && (
            <span style={{
              color: result.includes("successfully") ? "#28a745" : "#dc3545",
              fontWeight: "500"
            }}>
              {result}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}