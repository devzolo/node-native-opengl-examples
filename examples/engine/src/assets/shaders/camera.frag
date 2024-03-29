#version 330 core

out vec4 FragColor;

in vec3 v_barycentric;
in vec2 TexCoord;
in vec3 ourColor;
uniform sampler2D texture1;

void main()
{
  FragColor = texture(texture1, TexCoord);
}
