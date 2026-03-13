from manim import *

class Scene1_IntroductiontoNewtonsLawsofMotion(Scene):
    def construct(self):
        title = Text("Newton's Laws of Motion").to_edge(UP)
        bullet1 = Tex("1. First Law").to_edge(LEFT).shift(UP * 0.5)
        bullet2 = Tex("2. Second Law").next_to(bullet1, DOWN, aligned_edge=LEFT)
        bullet3 = Tex("3. Third Law").next_to(bullet2, DOWN, aligned_edge=LEFT)

        self.play(Write(title))
        self.wait(1)
        self.play(FadeIn(bullet1))
        self.wait(1)
        self.play(FadeIn(bullet2))
        self.wait(1)
        self.play(FadeIn(bullet3))
        self.wait(2)

class Scene2_FirstLawObjectAtRestRemainsAtRest(Scene):
    def construct(self):
        square = Square(side_length=1).set_fill(BLUE, opacity=0.7).set_stroke(width=2)
        square.move_to(DOWN * 1)
        surface = Line(start=LEFT * 4 + DOWN * 1.5, end=RIGHT * 4 + DOWN * 1.5, stroke_width=4)
        label = Tex("At Rest").next_to(square, UP, buff=0.3)

        self.play(Create(surface))
        self.play(Create(square))
        self.play(Write(label))
        self.wait(5)

class Scene3_FirstLawObjectInMotionContinuesWithConstantVelocity(Scene):
    def construct(self):
        square = Square(side_length=1).set_fill(GREEN, opacity=0.7).set_stroke(width=2)
        surface = Line(start=LEFT * 5 + DOWN * 1.5, end=RIGHT * 5 + DOWN * 1.5, stroke_width=4)
        velocity_arrow = Arrow(start=ORIGIN, end=RIGHT * 1.5, buff=0, color=YELLOW)
        velocity_label = Tex("Constant Velocity").next_to(velocity_arrow, UP, buff=0.2)

        square.move_to(LEFT * 4 + DOWN * 1)
        velocity_arrow.move_to(square.get_top() + UP * 0.3)
        velocity_label.next_to(velocity_arrow, UP, buff=0.2)

        self.play(Create(surface))
        self.play(Create(square))
        self.play(Create(velocity_arrow), Write(velocity_label))
        self.wait(1)
        self.play(square.animate.shift(RIGHT * 6), velocity_arrow.animate.shift(RIGHT * 6), velocity_label.animate.shift(RIGHT * 6), run_time=5)
        self.wait(1)

class Scene4_FirstLawExternalForceChangesMotion(Scene):
    def construct(self):
        square = Square(side_length=1).set_fill(GREEN, opacity=0.7).set_stroke(width=2)
        surface = Line(start=LEFT * 5 + DOWN * 1.5, end=RIGHT * 5 + DOWN * 1.5, stroke_width=4)

        velocity_arrow = Arrow(start=ORIGIN, end=RIGHT * 1.5, buff=0, color=YELLOW)
        velocity_label = Tex("Velocity").next_to(velocity_arrow, UP, buff=0.2)

        force_arrow = Arrow(start=RIGHT * 2 + DOWN * 1, end=RIGHT * 1 + DOWN * 1, buff=0, color=RED)
        force_label = Tex("External Force").next_to(force_arrow, UP, buff=0.2).set_color(RED)

        square.move_to(LEFT * 3 + DOWN * 1)
        velocity_arrow.move_to(square.get_top() + UP * 0.3)
        velocity_label.next_to(velocity_arrow, UP, buff=0.2)

        self.play(Create(surface))
        self.play(Create(square))
        self.play(Create(velocity_arrow), Write(velocity_label))
        self.wait(1)

        self.play(Create(force_arrow), Write(force_label))
        self.wait(1)

        # Animate velocity arrow changing direction and magnitude
        new_velocity_arrow = Arrow(start=ORIGIN, end=UP * 1.5 + RIGHT * 0.5, buff=0, color=YELLOW)
        new_velocity_label = Tex("Velocity").next_to(new_velocity_arrow, UP, buff=0.2)
        new_velocity_arrow.move_to(square.get_top() + UP * 0.3)
        new_velocity_label.next_to(new_velocity_arrow, UP, buff=0.2)

        self.play(Transform(velocity_arrow, new_velocity_arrow), Transform(velocity_label, new_velocity_label))
        self.wait(2)

class Scene5_SecondLawFEqualsmaFormula(Scene):
    def construct(self):
        formula = MathTex(r"F", r"=", r"m", r"a").scale(3)
        formula.move_to(UP * 1)

        force_text = Tex("Force").next_to(formula[0], DOWN, buff=0.3)
        mass_text = Tex("Mass").next_to(formula[2], DOWN, buff=0.3)
        accel_text = Tex("Acceleration").next_to(formula[3], DOWN, buff=0.3)

        self.play(Write(formula[0]))
        self.wait(1)
        self.play(Write(force_text))
        self.wait(1)
        self.play(Write(formula[1]))
        self.wait(0.5)
        self.play(Write(formula[2]))
        self.wait(1)
        self.play(Write(mass_text))
        self.wait(1)
        self.play(Write(formula[3]))
        self.wait(1)
        self.play(Write(accel_text))
        self.wait(2)

class Scene6_SecondLawForceCausesAccelerationProportionalToMass(Scene):
    def construct(self):
        surface = Line(start=LEFT * 6 + DOWN * 1.5, end=RIGHT * 6 + DOWN * 1.5, stroke_width=4)

        circle1 = Circle(radius=0.5, color=BLUE, fill_opacity=0.7).move_to(LEFT * 2 + DOWN * 1)
        label1 = Tex("Mass 1").next_to(circle1, DOWN, buff=0.2)

        circle2 = Circle(radius=1, color=GREEN, fill_opacity=0.7).move_to(RIGHT * 2 + DOWN * 1)
        label2 = Tex("Mass 2").next_to(circle2, DOWN, buff=0.2)

        force_arrow1 = Arrow(start=circle1.get_left() + LEFT * 0.1, end=circle1.get_left() + LEFT * 0.6, buff=0, color=RED)
        force_arrow1.flip()  # Point right
        force_arrow1.move_to(circle1.get_left() + LEFT * 0.35)

        force_arrow2 = Arrow(start=circle2.get_left() + LEFT * 0.1, end=circle2.get_left() + LEFT * 0.6, buff=0, color=RED)
        force_arrow2.flip()  # Point right
        force_arrow2.move_to(circle2.get_left() + LEFT * 0.35)

        force_arrow1.shift(RIGHT * 0.5)
        force_arrow2.shift(RIGHT * 0.5)

        force_arrow1 = Arrow(start=circle1.get_left() + LEFT * 0.1, end=circle1.get_left() + RIGHT * 0.6, buff=0, color=RED)
        force_arrow2 = Arrow(start=circle2.get_left() + LEFT * 0.1, end=circle2.get_left() + RIGHT * 0.6, buff=0, color=RED)

        force_arrow1.move_to(circle1.get_left() + RIGHT * 0.35)
        force_arrow2.move_to(circle2.get_left() + RIGHT * 0.35)

        velocity_arrow1 = Arrow(start=circle1.get_right() + RIGHT * 0.1, end=circle1.get_right() + RIGHT * 1.5, buff=0, color=YELLOW)
        velocity_arrow2 = Arrow(start=circle2.get_right() + RIGHT * 0.1, end=circle2.get_right() + RIGHT * 0.8, buff=0, color=YELLOW)

        self.play(Create(surface))
        self.play(Create(circle1), Write(label1))
        self.play(Create(circle2), Write(label2))
        self.wait(1)

        self.play(Create(force_arrow1), Create(force_arrow2))
        self.wait(1)

        self.play(Create(velocity_arrow1), Create(velocity_arrow2))
        self.wait(4)

class Scene7_ThirdLawEqualAndOppositeForces(Scene):
    def construct(self):
        square_left = Square(side_length=1).set_fill(BLUE, opacity=0.7).set_stroke(width=2).move_to(LEFT * 2 + DOWN * 1)
        square_right = Square(side_length=1).set_fill(GREEN, opacity=0.7).set_stroke(width=2).move_to(RIGHT * 2 + DOWN * 1)

        action_arrow = Arrow(start=square_left.get_right(), end=square_right.get_left(), buff=0, color=RED)
        action_label = Tex("Action Force").next_to(action_arrow, UP, buff=0.2).set_color(RED)

        reaction_arrow = Arrow(start=square_right.get_left(), end=square_left.get_right(), buff=0, color=BLUE)
        reaction_label = Tex("Reaction Force").next_to(reaction_arrow, DOWN, buff=0.2).set_color(BLUE)

        self.play(Create(square_left), Create(square_right))
        self.wait(1)
        self.play(Create(action_arrow), Write(action_label))
        self.wait(1)
        self.play(Create(reaction_arrow), Write(reaction_label))
        self.wait(3)

class Scene8_ThirdLawInteractionOfForcesBetweenTwoObjects(Scene):
    def construct(self):
        square_left = Square(side_length=1).set_fill(BLUE, opacity=0.7).set_stroke(width=2).move_to(LEFT * 2 + DOWN * 1)
        square_right = Square(side_length=1).set_fill(GREEN, opacity=0.7).set_stroke(width=2).move_to(RIGHT * 2 + DOWN * 1)

        action_arrow = Arrow(start=square_left.get_right(), end=square_right.get_left(), buff=0, color=RED)
        action_label = Tex("Action Force").next_to(action_arrow, UP, buff=0.2).set_color(RED)

        reaction_arrow = Arrow(start=square_right.get_left(), end=square_left.get_right(), buff=0, color=BLUE)
        reaction_label = Tex("Reaction Force").next_to(reaction_arrow, DOWN, buff=0.2).set_color(BLUE)

        self.play(Create(square_left), Create(square_right))
        self.play(Create(action_arrow), Write(action_label))
        self.play(Create(reaction_arrow), Write(reaction_label))
        self.wait(1)

        self.play(square_left.animate.shift(LEFT * 0.5), square_right.animate.shift(RIGHT * 0.5), run_time=2)
        self.wait(2)
