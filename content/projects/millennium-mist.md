title: MILLENNIUM_MIST
category: GAME_DEV
status: DEPLOYED
date: 2025-03
color: "#ff2d78"
summary: FPS prototype with 5 levels. Enemy AI via state machine — patrol, chase, attack, bullet-hell. Diverse weapon systems.
thumbnail: /static/images/card-millennium-mist.jpg
tags: Unity, C#, FSM, Level Design, AI
btn1_icon: play_circle
btn1_label: DEMO
btn2_icon: code
btn2_label: SOURCE
engine: Unity
order: 2

## Overview

Independently developed a shooter game prototype to validate core FPS gameplay feasibility. Focused on the integration of level design, enemy AI, and weapon systems.

## Responsibilities

- Independently completed game prototype design and development, covering 5 full levels
- Implemented core game logic in C# including enemy AI, weapon systems, and level mechanics
- Adopted state machine design pattern for diverse enemy AI behaviors

## Enemy AI System

| State | Behavior |
|-------|----------|
| Patrol | Waypoint-based movement with idle pauses |
| Chase | Player detection triggers pursuit with path recalculation |
| Attack | Range-based weapon selection and engagement |
| Bullet-Hell | Boss mode with complex projectile patterns |

## Key Features

- State machine architecture enabling modular AI behavior composition
- 5 distinct levels with progressive difficulty scaling
- Diverse weapon system with unique mechanics per weapon type
- Level mechanics that interact with AI and weapon systems for emergent gameplay
