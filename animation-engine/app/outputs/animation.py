from manim import *

class Scene1_DefinitionofKinematics(Scene):
    def construct(self):
        title = Text("Kinematics").to_edge(UP)
        subtitle = Text("Study of motion without considering forces").next_to(title, DOWN)
        self.play(Write(title))
        self.wait(2)
        self.play(Write(subtitle))
        self.wait(3)

class Scene2_Objectmovingalongastraightline(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-1, 1, 1],
            x_length=10,
            y_length=2,
            axis_config={"include_tip": True},
        ).to_edge(DOWN)
        x_label = axes.get_x_axis_label("x")
        line = Line(axes.c2p(-4, 0), axes.c2p(4, 0))
        dot = Dot(axes.c2p(-4, 0))
        self.play(Create(axes), Write(x_label), Create(line))
        self.wait(1)
        self.play(Create(dot))
        self.wait(1)
        self.play(dot.animate.move_to(axes.c2p(4, 0)), run_time=4)
        self.wait(2)

class Scene3_Positiondisplacementanddistance(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-1, 1, 1],
            x_length=10,
            y_length=2,
            axis_config={"include_tip": True},
        ).to_edge(DOWN)
        x_label = axes.get_x_axis_label("x")
        line = Line(axes.c2p(-4, 0), axes.c2p(4, 0))
        dot_initial = Dot(axes.c2p(-3, 0), color=BLUE)
        dot_final = Dot(axes.c2p(2, 0), color=RED)

        displacement_arrow = Arrow(
            start=axes.c2p(-3, 0.2),
            end=axes.c2p(2, 0.2),
            buff=0,
            color=GREEN
        )
        displacement_label = MathTex(r"\text{Displacement}").next_to(displacement_arrow, UP)

        distance_line = Line(axes.c2p(-3, -0.2), axes.c2p(2, -0.2), color=YELLOW)
        distance_label = MathTex(r"\text{Distance}").next_to(distance_line, DOWN)

        self.play(Create(axes), Write(x_label), Create(line))
        self.wait(1)
        self.play(Create(dot_initial), Create(dot_final))
        self.wait(1)
        self.play(Create(displacement_arrow), Write(displacement_label))
        self.wait(2)
        self.play(Create(distance_line), Write(distance_label))
        self.wait(3)

class Scene4_Velocityasrateofchangeofposition(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-1, 1, 1],
            x_length=10,
            y_length=2,
            axis_config={"include_tip": True},
        ).to_edge(DOWN)
        x_label = axes.get_x_axis_label("x")
        line = Line(axes.c2p(-4, 0), axes.c2p(4, 0))
        dot = Dot(axes.c2p(-4, 0))
        velocity_label = MathTex(r"\text{Velocity} = \frac{\Delta \text{position}}{\Delta \text{time}}")
        velocity_label.to_edge(UP)

        self.play(Create(axes), Write(x_label), Create(line))
        self.wait(1)
        self.play(Create(dot))
        self.wait(1)
        self.play(Write(velocity_label))
        self.wait(1)

        for x in range(-4, 4):
            self.play(
                dot.animate.move_to(axes.c2p(x, 0)),
                run_time=0.5
            )
            velocity_arrow = Arrow(
                start=dot.get_center(),
                end=dot.get_center() + np.array([0.8, 0, 0]),
                buff=0,
                color=RED
            )
            self.play(Create(velocity_arrow), run_time=0.3)
            self.wait(0.2)
            self.play(FadeOut(velocity_arrow))

        self.wait(2)

class Scene5_Accelerationasrateofchangeofvelocity(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-1, 1, 1],
            x_length=10,
            y_length=2,
            axis_config={"include_tip": True},
        ).to_edge(DOWN)
        x_label = axes.get_x_axis_label("x")
        line = Line(axes.c2p(-4, 0), axes.c2p(4, 0))
        dot = Dot(axes.c2p(-4, 0))
        acceleration_label = MathTex(r"\text{Acceleration} = \frac{\Delta \text{velocity}}{\Delta \text{time}}")
        acceleration_label.to_edge(UP)

        self.play(Create(axes), Write(x_label), Create(line))
        self.wait(1)
        self.play(Create(dot))
        self.wait(1)
        self.play(Write(acceleration_label))
        self.wait(1)

        velocities = [0.5, 1, 1.5, 2, 1.5, 1, 0.5]
        for v in velocities:
            velocity_arrow = Arrow(
                start=dot.get_center(),
                end=dot.get_center() + np.array([v, 0, 0]),
                buff=0,
                color=BLUE
            )
            self.play(Create(velocity_arrow), run_time=0.4)
            self.wait(0.2)
            self.play(FadeOut(velocity_arrow))

        acceleration_arrow = Arrow(
            start=dot.get_center() + np.array([1, 0.3, 0]),
            end=dot.get_center() + np.array([2, 0.3, 0]),
            buff=0,
            color=RED
        )
        acceleration_label.next_to(acceleration_arrow, UP)
        self.play(Create(acceleration_arrow), Write(acceleration_label))
        self.wait(3)
