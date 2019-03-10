export default class OutlineMaterial extends Laya.BaseMaterial {
    public static DIFFUSETEXTURE: number = Laya.Shader3D.propertyNameToID("u_Texture");
    public static OUTLINECOLOR: number = Laya.Shader3D.propertyNameToID("u_OutlineColor");
    public static OUTLINEWIDTH: number = Laya.Shader3D.propertyNameToID("u_OutlineWidth");

    /**
     * 设置贴图
     */
    public set DiffuseTexture(value: Laya.BaseTexture) {
        this._shaderValues.setTexture(OutlineMaterial.DIFFUSETEXTURE, value)
    }

    /**
     * 设置描边颜色
     */
    public set OutlineColor(value: Laya.Vector4) {
        this._shaderValues.setVector(OutlineMaterial.OUTLINECOLOR, value)
    }

    /**
     * 设置
     */
    public set OutlineWidth(value: number) {
        this._shaderValues.setNumber(OutlineMaterial.OUTLINEWIDTH, value)
    }

    constructor() {
        super()

        var attributeMap = {
            'a_Position': Laya.VertexMesh.MESH_POSITION0,
            'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
            'a_Texcoord': Laya.VertexMesh.MESH_TEXTURECOORDINATE0
        }
        var uniformMap = {
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
            'u_Texture': Laya.Shader3D.PERIOD_MATERIAL,
            'u_OutlineColor': Laya.Shader3D.PERIOD_MATERIAL,
            'u_OutlineWidth': Laya.Shader3D.PERIOD_MATERIAL
        }

        var outline_vs = `
            uniform mat4 u_MvpMatrix;
            uniform mat4 u_WorldMat;
            uniform float u_OutlineWidth;
            attribute vec4 a_Position;
            attribute vec3 a_Normal;
            varying vec3 v_Normal;
            void main()
            {
                gl_Position = u_MvpMatrix * a_Position;
                mat3 worldMat = mat3(u_WorldMat);
                v_Normal = worldMat * a_Normal;
                gl_Position.xy += v_Normal.xy * u_OutlineWidth;
            }`
        var outline_ps = `
            #ifdef FSHIGHPRECISION
                precision highp float;
            #else
                precision mediump float;
            #endif
            varying vec3 v_Normal;
            uniform vec4 u_OutlineColor;
            void main()
            {
                gl_FragColor = u_OutlineColor;
            }`

        var base_vs = `
            attribute vec4 a_Position;
            attribute vec2 a_Texcoord;
            attribute vec3 a_Normal;

            varying vec2 v_Texcoord;
            varying vec3 v_Normal;

            uniform mat4 u_MvpMatrix;
            uniform mat4 u_WorldMat;
            
            void main()
            {
                mat3 worldMat = mat3(u_WorldMat);
                v_Normal = worldMat * a_Normal;
                v_Texcoord = a_Texcoord;
                gl_Position = u_MvpMatrix * a_Position;
            }`

        var base_ps = `
            #ifdef FSHIGHPRECISION
                precision highp float;
            #else
                precision mediump float;
            #endif
            varying vec3 v_Normal;
            varying vec2 v_Texcoord;

            uniform sampler2D u_Texture;

            void main()
            {
                gl_FragColor = texture2D(u_Texture, v_Texcoord);
            }`

        var customShader: Laya.Shader3D = Laya.Shader3D.add("OutlineShader");
        var subShader: Laya.SubShader = new Laya.SubShader(attributeMap, uniformMap,Laya.SkinnedMeshSprite3D.shaderDefines);
        customShader.addSubShader(subShader);
        subShader.addShaderPass(outline_vs, outline_ps);
        subShader.addShaderPass(base_vs, base_ps);

        this.setShaderName("OutlineShader");

        this.getRenderState(0).cull = 1;
    }



}