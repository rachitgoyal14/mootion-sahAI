# **Bloop: Real-Time Generation of Educational Videos via LLM-Orchestrated Visual, Audio, and Avatar Pipelines**

## **Abstract**

We present **Bloop**, an end-to-end system for real-time generation of educational explainer videos from unstructured queries and documents. Unlike existing educational AI systems that primarily generate text or static slides, Bloop synthesizes **animated visual explanations**, **scene-aligned narration**, and **optional talking avatars** in a single fault-tolerant pipeline.

The system integrates large language models (LLMs) for structured scene planning, Manim for programmatic animation rendering, neural text-to-speech for narration, FFmpeg-based temporal alignment, and SadTalker for photorealistic talking avatars. Bloop introduces a **scene-isolated rendering strategy with automated LLM-based error repair**, enabling robust real-time generation even under imperfect model outputs.

The resulting architecture demonstrates a practical pathway toward scalable, personalized, and visually grounded AI education systems.

---

## **1. Introduction**

Educational content generation has largely focused on textual explanations or static media. However, many STEM concepts—particularly in mathematics, physics, and chemistry—require **visual reasoning, temporal dynamics, and spatial intuition**.

Bloop addresses this gap by transforming educational prompts into **fully rendered explainer videos**, combining:

* Programmatic animations (Manim)
* Natural language narration (TTS)
* Optional human-like delivery (SadTalker avatars)

All outputs are generated **on-demand**, without precomputed assets.

---

## **2. System Overview**

At a high level, Bloop operates as a **distributed, service-oriented pipeline**:

1. Query understanding and content generation
2. Structured scene decomposition
3. Independent visual rendering per scene
4. Audio synthesis and synchronization
5. Optional avatar animation
6. Video composition and delivery

The design emphasizes **fault tolerance, modularity, and real-time execution**.

---

## **3. Architecture**

### **3.1 High-Level Architecture**

```
Client
  │
  ▼
FastAPI Gateway (QA Service)
  │
  ├── LLM Answer Generation
  │
  └── Manim Video Service
        │
        ├── Scene Planning (LLM → JSON)
        │
        ├── Scene-by-Scene Manim Rendering
        │   ├── Error Detection
        │   ├── LLM-Based Auto Repair
        │   └── Scene Skipping (if unrecoverable)
        │
        ├── TTS (Per Scene)
        ├── FFmpeg Audio–Video Alignment
        └── Scene Stitching → Final Animation
              │
              └── (Optional) SadTalker Avatar
                    │
                    └── Side-by-Side Video Merge
```

---

## **4. Scene Planning via LLMs**

Bloop converts raw prompts or document-based answers into **structured scene graphs** using LLMs.

Each scene contains:

* Concept focus
* Visual intent
* Duration constraints
* Rendering hints compatible with Manim

This intermediate representation allows strict validation before rendering and enables selective retries.

---

## **5. Manim Rendering Engine**

### **5.1 Scene Isolation**

Each Manim scene is rendered **independently** in its own execution context. This prevents global failure due to:

* LaTeX compilation errors
* Unsupported Manim APIs
* Numerical or geometry issues

### **5.2 Automated Error Repair**

When a scene fails:

1. The Manim error log is captured
2. The failing scene code + error is sent back to the LLM
3. A corrected scene is regenerated
4. Rendering is retried once
5. Scene is skipped if still invalid

This design ensures **progressive output generation** under uncertainty.

---

## **6. Audio Generation and Synchronization**

Narration is generated **per scene** using neural TTS.
FFmpeg is used to:

* Pad video if audio is longer
* Pad audio if video is longer
* Preserve temporal alignment without re-encoding loss

This guarantees narration always matches visual pacing.

---

## **7. Talking Avatar Integration**

Bloop optionally generates a **talking avatar** using SadTalker:

* Final video audio is extracted
* Audio + avatar image sent to SadTalker
* Avatar video is rendered asynchronously
* Final output combines:

  * Left: Educational animation
  * Right: Talking avatar

This avoids visual occlusion and preserves instructional clarity.

---

## **8. Side-by-Side Video Composition**

Instead of picture-in-picture overlays, Bloop uses **horizontal concatenation**:

```
┌───────────────────────┬───────────────────────┐
│  Manim Animation      │  Talking Avatar        │
│  (Concept Visuals)    │  (Narration)           │
└───────────────────────┴───────────────────────┘
```

This layout maintains both:

* Visual explanation fidelity
* Human-like delivery presence

---

## **9. Fault Tolerance & Reliability**

Bloop is designed with **failure as a first-class consideration**:

* Scene-level isolation
* Partial video delivery
* Graceful degradation
* No pipeline-wide crashes
* Deterministic outputs under retries

---

## **10. Implementation Stack**
```

| Component        | Technology         |
| ---------------- | ------------------ |
| Backend API      | FastAPI            |
| LLM              | GPT / Azure OpenAI |
| Animation        | Manim Community    |
| TTS              | Neural TTS         |
| Video Processing | FFmpeg             |
| Avatar           | SadTalker          |
| Orchestration    | Python subprocess  |
| Rendering        | On-demand          |
```
---

## **11. Experimental Results**

During hackathon evaluation, Bloop successfully generated:

* Multi-scene STEM explainer videos
* Real-time Manim animations
* Fully synchronized narration
* Side-by-side avatar videos

Judges highlighted **system depth, integration complexity, and robustness**.

---

## **12. Limitations**

* Rendering time increases with scene complexity
* GPU acceleration not yet applied to Manim
* Avatar generation latency depends on SadTalker model

---

## **13. Future Work**

* Adaptive pacing based on learner profile
* Emotion-aware avatar narration
* Interactive timelines
* Classroom-scale batch rendering
* Cloud-native job scheduling

---

## **14. Conclusion**

Bloop demonstrates that **real-time, fully visual educational video generation** is feasible using current generative AI systems when combined with disciplined system design.

By treating visuals, audio, and avatars as first-class outputs—and by embracing fault tolerance—Bloop moves beyond text-based education toward **explainable, visual intelligence**.


