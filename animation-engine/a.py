from manim import *

class StoryArcTracker(Scene):
    def construct(self):
        # Configuration
        title_font_size = 40
        body_font_size = 24
        neutral_color = BLUE_B
        positive_color = GREEN_E
        negative_color = RED_E
        contrarian_color = YELLOW_D

        # --- SECTION 1: KEY PLAYERS MAPPED ---
        # NARRATION: "We start by looking at the primary players in this unfolding story: 
        # TechGiant Corp and their emerging rival, InnovateSoft. Their relationship 
        # is the central axis of today's market shift."
        
        header = Text("Key Players & Relationships", font_size=title_font_size).to_edge(UP)
        
        player_a = VGroup(Circle(radius=0.8, color=BLUE), Text("TechGiant", font_size=20)).arrange(DOWN, buff=0.2)
        player_b = VGroup(Circle(radius=0.8, color=WHITE), Text("InnovateSoft", font_size=20)).arrange(DOWN, buff=0.2)
        subsidiary = VGroup(Circle(radius=0.5, color=GRAY), Text("Sub-Div", font_size=15)).arrange(DOWN, buff=0.1)
        
        players = VGroup(player_a, player_b, subsidiary).arrange(RIGHT, buff=2)
        players.move_to(ORIGIN)
        
        conn_1 = Arrow(player_a.get_right(), player_b.get_left(), buff=0.1)
        conn_2 = Line(player_a.get_bottom(), subsidiary.get_top(), buff=0.1).add_tip(tip_length=0.2)
        label_rivalry = Text("Market Rivalry", font_size=18, color=RED).next_to(conn_1, UP)

        self.play(Write(header))
        self.play(FadeIn(player_a), FadeIn(player_b))
        self.play(Create(conn_1), Write(label_rivalry))
        self.wait(2)
        self.play(Create(conn_2), FadeIn(subsidiary))
        self.wait(4)
        
        self.play(FadeOut(players, conn_1, conn_2, label_rivalry, header))

        # --- SECTION 2: INTERACTIVE TIMELINE ---
        # NARRATION: "Tracing back the timeline, the friction began in Q1 with a 
        # failed merger, followed by a sudden leadership change in June, leading 
        # to the aggressive expansion we see today."
        
        timeline_header = Text("Event Timeline", font_size=title_font_size).to_edge(UP)
        timeline = NumberLine(x_range=[0, 10, 1], length=10, include_tip=True, include_numbers=False)
        timeline.move_to(ORIGIN)
        
        # Events
        events = [
            (2, "Q1: Failed Merger", "Negotiations collapsed over valuation."),
            (5, "June: CEO Exit", "Surprise resignation sparked volatility."),
            (8, "Today: Expansion", "Aggressive move into new territories.")
        ]

        self.play(Write(timeline_header), Create(timeline))
        
        for x_pos, label, detail in events:
            dot = Dot(timeline.number_to_point(x_pos), color=YELLOW)
            lbl = Text(label, font_size=20, color=YELLOW).next_to(dot, UP)
            det = Text(detail, font_size=18).next_to(lbl, UP, buff=0.2)
            
            self.play(FadeIn(dot, scale=1.5), Write(lbl))
            self.play(FadeIn(det))
            self.wait(5) # Pacing for narration
            self.play(FadeOut(lbl), FadeOut(det))

        self.play(FadeOut(timeline), FadeOut(dot), FadeOut(timeline_header))

        # --- SECTION 3: SENTIMENT SHIFTS ---
        # NARRATION: "Sentiment has been a roller coaster. Initial optimism turned into 
        # sharp bearish concern as regulatory hurdles mounted, though we are 
        # seeing a slight recovery in the latest session."

        gauge_header = Text("Market Sentiment Tracker", font_size=title_font_size).to_edge(UP)
        
        # Simple Sentiment Line Graph
        axes = Axes(x_range=[0, 6, 1], y_range=[-3, 3, 1], axis_config={"include_tip": False})
        labels = axes.get_axis_labels(x_label="Time", y_labeRl="Sentiment")
        
        # Sentiment Curve
        sentiment_path = axes.plot(lambda x: 2*np.sin(x) * np.exp(-0.1*x), color=WHITE)
        
        moving_dot = Dot(color=GREEN).move_to(axes.c2p(0, 0))
        
        self.play(Write(gauge_header), Create(axes), Write(labels))
        self.play(Create(sentiment_path), run_time=4)
        
        # Dynamic node color change representing sentiment shift
        sentiment_rect = RoundedRectangle(corner_radius=0.2, height=1, width=3).to_edge(RIGHT)
        sentiment_text = Text("BULLISH", color=GREEN, font_size=30).move_to(sentiment_rect)
        
        self.play(FadeIn(sentiment_rect), Write(sentiment_text))
        self.wait(2)
        self.play(sentiment_text.animate.set_text("BEARISH").set_color(RED), sentiment_rect.animate.set_color(RED))
        self.wait(4)
        
        self.play(FadeOut(axes, labels, sentiment_path, sentiment_rect, sentiment_text, gauge_header))

        # --- SECTION 4: CONTRARIAN PERSPECTIVES ---
        # NARRATION: "While the mainstream sees this as a decline, a growing 
        # contrarian view suggests this is actually a necessary consolidation, 
        # positioning the company for a massive decade of growth."

        mainstream_group = VGroup(
            Text("Mainstream View", font_size=30, color=BLUE),
            Text("- Market Oversaturation\n- Declining Margins", font_size=20)
        ).arrange(DOWN).shift(LEFT * 3)

        contrarian_group = VGroup(
            Text("Contrarian View", font_size=30, color=ORANGE),
            Text("- Efficient Consolidation\n- Long-term Buy Signal", font_size=20)
        ).arrange(DOWN).shift(RIGHT * 3)

        divider = DashedLine(UP*2, DOWN*2, color=GRAY)

        self.play(FadeIn(mainstream_group))
        self.wait(3)
        self.play(Create(divider))
        self.play(FadeIn(contrarian_group), contrarian_group.animate.scale(1.2))
        self.wait(6)

        self.play(FadeOut(mainstream_group), FadeOut(contrarian_group), FadeOut(divider))

        # --- SECTION 5: WHAT TO WATCH NEXT ---
        # NARRATION: "Looking ahead, keep an eye on these two paths. Scenario A involves 
        # a regulatory green light leading to a rally, while Scenario B considers 
        # further litigation causing a pivot to international markets."

        watch_header = Text("What to Watch Next", font_size=title_font_size).to_edge(UP)
        start_point = LEFT * 4
        
        arrow_a = Arrow(start_point, RIGHT * 2 + UP * 1.5, color=GREEN)
        arrow_b = Arrow(start_point, RIGHT * 2 + DOWN * 1.5, color=YELLOW)
        
        label_a = Text("Scenario A: Regulatory Approval", font_size=22).next_to(arrow_a.get_end(), RIGHT)
        label_b = Text("Scenario B: International Pivot", font_size=22).next_to(arrow_b.get_end(), RIGHT)

        self.play(Write(watch_header))
        self.play(Create(arrow_a), Write(label_a))
        self.wait(4)
        self.play(Create(arrow_b), Write(label_b))
        self.wait(6)

        # Final Branding/Closing
        final_text = Text("Story Arc Tracker", font_size=20, color=GRAY).to_edge(DR)
        self.play(Write(final_text))
        self.wait(3)