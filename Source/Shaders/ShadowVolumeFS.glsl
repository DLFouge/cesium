// emulated noperspective
varying float v_WindowZ;
varying vec4 v_color;
varying vec4 v_position;

void writeDepthClampedToFarPlane()
{
#ifdef GL_EXT_frag_depth
    gl_FragDepthEXT = min(v_WindowZ * gl_FragCoord.w, 1.0);
#endif
}

void main(void)
{
    gl_FragColor = v_color;
    czm_logDepth(v_position.w);
}
