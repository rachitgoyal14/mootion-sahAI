from manim import *

class Scene1_Introductiontoquadraticequations(Scene):
    def construct(self):
        eq = MathTex(r"ax^2 + bx + c = 0")
        eq.set_opacity(0)
        self.play(FadeIn(eq, run_time=2))
        self.wait(3)

class Scene2_Highlightpopulareducationalplatforms(Scene):
    def construct(self):
        # Since no images allowed, represent logos by Text
        khan = Text("Khan Academy")
        crash = Text("Crash Course")
        threeblue = Text("3Blue1Brown")

        khan.to_edge(LEFT)
        crash.move_to(ORIGIN)
        threeblue.to_edge(RIGHT)

        # Bounce animation: scale up and down
        def bounce(mob):
            return (
                mob.animate.scale(1.2).set_opacity(1).set_color(WHITE)
                + mob.animate.scale(1/1.2).set_opacity(1).set_color(WHITE)
            )

        self.play(FadeIn(khan), run_time=0.5)
        self.play(khan.animate.scale(1.2), run_time=0.3)
        self.play(khan.animate.scale(1/1.2), run_time=0.3)
        self.wait(0.5)

        self.play(FadeIn(crash), run_time=0.5)
        self.play(crash.animate.scale(1.2), run_time=0.3)
        self.play(crash.animate.scale(1/1.2), run_time=0.3)
        self.wait(0.5)

        self.play(FadeIn(threeblue), run_time=0.5)
        self.play(threeblue.animate.scale(1.2), run_time=0.3)
        self.play(threeblue.animate.scale(1/1.2), run_time=0.3)
        self.wait(2)

class Scene3_YouTubeasasourceforlearning(Scene):
    def construct(self):
        # Represent logos from previous scene as Text
        khan = Text("Khan Academy").to_edge(LEFT)
        crash = Text("Crash Course").move_to(ORIGIN)
        threeblue = Text("3Blue1Brown").to_edge(RIGHT)
        self.add(khan, crash, threeblue)

        # Create a large YouTube play button icon below logos
        # Use a red rounded rectangle with a white triangle inside
        rect = RoundedRectangle(corner_radius=0.3, height=2, width=3, fill_color=RED, fill_opacity=1, stroke_color=RED)
        triangle = Polygon(
            [-0.5, -0.7, 0],
            [1, 0, 0],
            [-0.5, 0.7, 0],
            fill_color=WHITE,
            fill_opacity=1,
            stroke_color=WHITE
        )
        play_button = VGroup(rect, triangle)
        play_button.next_to(khan, DOWN, buff=1.5).shift(UP*0.5)

        self.play(FadeIn(play_button, run_time=2))

        # Glowing outline pulsing gently
        glow = rect.copy()
        glow.set_stroke(color=YELLOW, width=8)
        glow.set_fill(opacity=0)

        self.add(glow)

        def pulse(mob):
            return (
                mob.animate.set_stroke(width=12).set_opacity(0.7).set_color(YELLOW)
                + mob.animate.set_stroke(width=8).set_opacity(0.4).set_color(YELLOW)
            )

        for _ in range(3):
            self.play(glow.animate.set_stroke(width=12, opacity=0.7), run_time=1)
            self.play(glow.animate.set_stroke(width=8, opacity=0.4), run_time=1)

        self.wait(1)

class Scene4_Videosprovideclearexplanations(Scene):
    def construct(self):
        # Stylized video player interface
        frame = Rectangle(height=3, width=5, stroke_color=WHITE)
        frame.set_fill(BLACK, opacity=0.8)

        # Play button in center
        play_triangle = Polygon(
            [-0.3, -0.5, 0],
            [0.6, 0, 0],
            [-0.3, 0.5, 0],
            fill_color=WHITE,
            fill_opacity=0.8,
            stroke_color=WHITE
        )

        play_button = VGroup(play_triangle)
        play_button.move_to(frame.get_center())

        # Progress bar below frame
        bar_back = Rectangle(height=0.15, width=4.5, fill_color=GRAY, fill_opacity=0.5, stroke_color=WHITE)
        bar_front = Rectangle(height=0.15, width=0.1, fill_color=RED, fill_opacity=0.8, stroke_color=RED)

        progress_bar = VGroup(bar_back, bar_front)
        progress_bar.next_to(frame, DOWN, buff=0.3)
        progress_bar.align_to(frame, LEFT)

        # Quadratic graph inside frame
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-1, 5, 1],
            x_length=4.5,
            y_length=2.5,
            axis_config={"include_tip": False}
        )
        axes.move_to(frame.get_center())

        graph = axes.plot(lambda x: x**2 / 2, x_range=[-2.5, 2.5], color=YELLOW)

        self.play(Create(frame), run_time=1.5)
        self.play(FadeIn(play_button), run_time=1)
        self.play(Create(bar_back), run_time=0.5)
        self.play(Create(bar_front), run_time=0.5)

        self.wait(0.5)

        # Draw quadratic graph dynamically
        self.play(Create(axes), run_time=1)
        self.play(Create(graph), run_time=3)

        self.wait(2)

class Scene5_Exampleshelpunderstanding(Scene):
    def construct(self):
        # Blackboard style background
        blackboard = Rectangle(width=7, height=4, fill_color=BLACK, fill_opacity=1, stroke_color=WHITE)
        self.add(blackboard)

        steps = [
            MathTex(r"ax^2 + bx + c = 0"),
            MathTex(r"ax^2 + bx = -c"),
            MathTex(r"x^2 + \frac{b}{a}x = -\frac{c}{a}"),
            MathTex(r"x^2 + \frac{b}{a}x + \left(\frac{b}{2a}\right)^2 = -\frac{c}{a} + \left(\frac{b}{2a}\right)^2"),
            MathTex(r"\left(x + \frac{b}{2a}\right)^2 = \frac{b^2 - 4ac}{4a^2}"),
            MathTex(r"x + \frac{b}{2a} = \pm \frac{\sqrt{b^2 - 4ac}}{2a}"),
            MathTex(r"x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
        ]

        for i, step in enumerate(steps):
            step.to_edge(UP).shift(DOWN * i * 0.5)

        rect = SurroundingRectangle(steps[0], color=YELLOW)

        self.play(Write(steps[0]), run_time=2)
        self.play(Create(rect), run_time=1)
        self.wait(1)

        for i in range(1, len(steps)):
            new_rect = SurroundingRectangle(steps[i], color=YELLOW)
            self.play(Transform(rect, new_rect), Transform(steps[i-1], steps[i]), run_time=2)
            self.wait(1)

        self.wait(2)