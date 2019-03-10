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
     * 设置描边宽度
     */
    public set OutlineWidth(value: number) {
        this._shaderValues.setNumber(OutlineMaterial.OUTLINEWIDTH, value)
    }

    constructor() {
        super()

        var attributeMap = {
            'a_Position': Laya.VertexMesh.MESH_POSITION0,
            'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
            'a_Texcoord': Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_BoneWeights': Laya.VertexMesh.MESH_BLENDWEIGHT0, 
            'a_BoneIndices': Laya.VertexMesh.MESH_BLENDINDICES0
        }
        var uniformMap = {
            'u_Bones': Laya.Shader3D.PERIOD_CUSTOM,
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
            #ifdef BONE
                attribute vec4 a_BoneIndices;
                attribute vec4 a_BoneWeights;
                const int c_MaxBoneCount = 24;
                uniform mat4 u_Bones[c_MaxBoneCount];
            #endif   
            void main()
            {
                #ifdef BONE
                    mat4 skinTransform=mat4(0.0);
                    skinTransform += u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
                    skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
                    skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
                    skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
                    vec4 position = skinTransform * a_Position;
                    gl_Position = u_MvpMatrix * position;
                    mat3 worldMat=mat3(u_WorldMat * skinTransform);
                #else
                    gl_Position = u_MvpMatrix * a_Position;
                    mat3 worldMat = mat3(u_WorldMat);
                #endif
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

            #ifdef BONE
                attribute vec4 a_BoneIndices;
                attribute vec4 a_BoneWeights;
                const int c_MaxBoneCount = 24;
                uniform mat4 u_Bones[c_MaxBoneCount];
            #endif 

            void main()
            {
                #ifdef BONE
                    mat4 skinTransform=mat4(0.0);
                    skinTransform += u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
                    skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
                    skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
                    skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
                    vec4 position = skinTransform * a_Position;
                    gl_Position = u_MvpMatrix * position;
                    mat3 worldMat = mat3(u_WorldMat * skinTransform);
                #else
                    gl_Position = u_MvpMatrix * a_Position;
                    mat3 worldMat = mat3(u_WorldMat);
                #endif
                v_Normal = worldMat * a_Normal;
                v_Texcoord = a_Texcoord;
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