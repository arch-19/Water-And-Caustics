# Water-And-Caustics
For the purpose of this project, we wanted to render a realistic simulation of an underwater scene. In particular we wanted to implement the behaviour of light in water which includes reflection, refraction, and also study how caustics are formed and simulated. We were inspired by Evan Wallace’s WebGL Water for the project as well.

## Goals
● Render water surface
● Simulate behaviour of light under the water surface
● Implement realistic effect of Caustics on the floor of the water body

## Implementation

### Code base
<img src="https://github.com/arch-19/Water-And-Caustics/blob/master/images/p2.png" width="300">

We based our project off the code used in Project 3 for the mesh spring system. We included the buoyant force, which is the upward force exerted by the water body on the surface and altered the values of mass of the particles, viscosity, damping and orientation of the surface to accurately simulate the properties of water. 

### Cube Mapping and Environment Reflection
<img src="https://github.com/arch-19/Water-And-Caustics/blob/master/images/p3.png" width="300">

### Water And Pool Shader
<img src="https://github.com/arch-19/Water-And-Caustics/blob/master/images/p4.png" width="300">

To further simulate the nature of water, we added a water shader, that added the effect of ripples and refractive properties. 

### Pool Shader

<img src="https://github.com/arch-19/Water-And-Caustics/blob/master/images/p5.png" width="300">

To view the effect of caustics, we needed a surface for the floor of the water body and implemented a tiled pool surface in a second cube map to contain the water. In the pool shader we include the refractive properties of light and the fragment shader alters the color of the pool accordingly. 

### Caustics

<img src="https://github.com/arch-19/Water-And-Caustics/blob/master/images/p6.png" width ="300">

To get the effect of caustics, we use a backward ray tracing method to trace light rays from the floor surface to the surface of water, and using the inverse of Snell’s Law we were able to further trace the light ray above the surface. We pass the normals from the water surface to the mesh rendering the floor surface. 

## Physics
While rendering a water body, a clear distinction can be made from objects and the view above the surface compared to below the surface and this is mainly through the different behaviour of light above and below the surface. 
### Properties of Water Surface
A water surface can be represented as a mesh of particles, each having a mass, position and velocity. The surface tension that causes a water surface to look smooth can be approximated to the forces of collision and cohesion between the water molecules of the surface. 

The height of the water causes an upward buoyant force. In addition to the forces every particle exerts on its neighboring particles. The forces exerted by the water particles on its neighbors can be characterised by the mass spring system.

**Spring Forces**
The combination of Structural, Shear and Flexion forces give rise to the total Spring force between particles on the surface. 
**Gravity**
Every particle on the surface will be acted on by the force of gravity in the downward direction (mass x 9.8m/s) and this is taken into account. 
**Damping**
The force on the particles dampen with distance and velocity. 
**Viscous Force**
The fluidity of the surface is set to a value which allows the mesh surface to simulate the properties of water. 
**Buoyant Force**
Water exerts an upward force called Buoyant force which increases with depth of water. 


### Properties of Light at Water Surface
**Reflection**
Rays that hit the surface are then reflected at the same angle and we can see the reflected image in our view. Water reflects what is above the surface, but the reflectance can vary depending on the nature of the water body.
 
**Refraction**
Refraction is the bending of light rays as they move from one material to another and the amount refraction is determined by the Index of refraction of both materials. Refraction can be defined by Snell’s Law. In this case, light rays travel from air which has a refractive index of 1 to water whose refractive index is 1.33. 
 
**Fresnel Effect**
When a material, for example glass or water exhibit properties of both reflection and refraction, we can observe the Fresnel Effect. The amount of light that is reflected or refracted is determined by the Fresnel Equations. These equations use the angle of incidence to determine how much light is reflected or refracted by the surface.
 
### Caustics
Caustics result from light rays reflecting or refracting from a curved surface and hence focusing only in certain areas of the receiving surface. Photons are refracted at the surface and some rays are concentrated at certain parts of the floor of the water pool. 

Once bent, photons advance through the water, their intensity attenuating as they get deeper. Eventually, some of these photons will strike the ocean floor, lighting it. Due to the the water surface waviness, photons entering the water from different paths can end up lighting the same area of the ocean floor. Whenever this happens, we see a bright spot created by the concentration of light in a caustic, similar to the way a lens focuses light.

## References
References
WebGL Water by Evan Wallace : Evan Wallace http://madebyevan.com/webgl-water/
Water Caustic: GPU Gem https://developer.nvidia.com/gpugems/GPUGems/gpugems_ch02.html

