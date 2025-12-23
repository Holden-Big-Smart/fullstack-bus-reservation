import React, { useState } from "react";
import { Plus, Layout, Edit3, X } from "lucide-react";
import BusDrawingBoard from "../../components/admin/BusDrawingBoard";
import axios from "axios";
import API_URL from "../../api/config";

export default function BusManage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState(null); // 'form' 或 'drawing'
  const [busName, setBusName] = useState("");

  // 表单模式的状态
  const [formData, setFormData] = useState({
    rows: 10,
    cols: 5,
    aisleCols: "2",
  });
  const [preFilledGrid, setPreFilledGrid] = useState(null);

  // 核心逻辑：从表单生成网格并跳转
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { rows, cols, aisleCols } = formData;
    const aisles = aisleCols.split(",").map((n) => parseInt(n.trim()) - 1); // 转为0索引

    // 1. 生成初始矩阵
    const generatedGrid = Array(Number(rows))
      .fill()
      .map((_, y) =>
        Array(Number(cols))
          .fill()
          .map((_, x) => {
            const isAisle = aisles.includes(x);
            return {
              x,
              y,
              type: isAisle ? "aisle" : "seat", // 走廊位标蓝，其他默认设为座位
              labelGrid: "",
              labelSeq: "",
            };
          })
      );

    // 2. 将生成的数据传入状态
    setPreFilledGrid(generatedGrid);
    // 3. 自动切换到绘图模式进行微调
    setCreateMode("drawing");
  };

  // 临时修改 BusManage.jsx 用于测试
  const handleDrawingSave = async (grid) => {
    if (!busName) return alert("请输入巴士名称");

    const layoutData = grid.flat();
    const seatsOnly = layoutData.filter((c) => c.type === "seat");

    // ✨ 重点观察这里
    console.log(">>> 测试：绘图数据包已生成 <<<");
    console.log("巴士名称:", busName);
    console.log("布局矩阵:", layoutData); // 检查 type 是否正确
    console.log(
      "双编号绑定示例:",
      seatsOnly.slice(0, 3).map((s) => ({
        坐标: `${s.y}-${s.x}`,
        空间编号: s.labelGrid, // 应为 1A, 1B 等
        逻辑序号: s.labelSeq, // 应为 01, 02 等
      }))
    );

    alert(
      `前端逻辑测试成功！已生成 ${seatsOnly.length} 个座位的双编号绑定数据，请查看控制台。`
    );
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCreateMode(null);
    setBusName("");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">巴士车辆管理</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} /> 创建新巴士
        </button>
      </div>

      {/* 车辆列表占位 (后续实现) */}
      <div className="bg-white rounded-xl shadow border border-slate-100 p-20 text-center text-slate-400">
        目前还没有巴士，点击右上角开始创建。
      </div>

      {/* 创建模式选择 & 绘图板 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* 模态框头部 */}
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-700">
                {createMode === "drawing"
                  ? `正在绘制：${busName || "新巴士"}`
                  : "选择创建方式"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="flex-1 overflow-auto">
              {/* 逻辑开始 */}
              {!createMode ? (
                /* 步骤1：模式选择 UI */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-12">
                  <button
                    onClick={() => setCreateMode("form")}
                    className="group p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                      <Layout className="text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      表单创建 (传统模式)
                    </h3>
                    <p className="text-slate-500 text-sm">
                      通过输入行列等数值快速生成布局。
                    </p>
                  </button>

                  <button
                    onClick={() => setCreateMode("drawing")}
                    className="group p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-green-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                      <Edit3 className="text-slate-500 group-hover:text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      绘图创建 (直观模式)
                    </h3>
                    <p className="text-slate-500 text-sm">
                      在画板上直接标记座位和过道。
                    </p>
                  </button>
                </div>
              ) : createMode === "form" ? (
                /* 步骤2：表单填写界面 */
                <form
                  onSubmit={handleFormSubmit}
                  className="p-12 max-w-lg mx-auto space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      巴士名称/车牌
                    </label>
                    <input
                      required
                      value={busName}
                      onChange={(e) => setBusName(e.target.value)}
                      className="w-full border rounded-lg p-2"
                      placeholder="如：粤B88888"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        总排数
                      </label>
                      <input
                        type="number"
                        value={formData.rows}
                        onChange={(e) =>
                          setFormData({ ...formData, rows: e.target.value })
                        }
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        每排总列数
                      </label>
                      <input
                        type="number"
                        value={formData.cols}
                        onChange={(e) =>
                          setFormData({ ...formData, cols: e.target.value })
                        }
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      过道列号(从1开始，逗号分隔)
                    </label>
                    <input
                      value={formData.aisleCols}
                      onChange={(e) =>
                        setFormData({ ...formData, aisleCols: e.target.value })
                      }
                      className="w-full border rounded-lg p-2"
                      placeholder="例如：3"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                  >
                    生成基础布局并去绘画微调 →
                  </button>
                </form>
              ) : (
                /* 步骤2：绘图模式 (createMode 为 'drawing' 时) */
                <div className="h-full flex flex-col">
                  <div className="p-4 bg-slate-100 flex gap-4 items-center">
                    <span className="font-bold">
                      正在微调: {busName || "未命名"}
                    </span>
                    <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">
                      表单已自动填充
                    </span>
                  </div>
                  <div className="flex-1 min-h-[500px]">
                    <BusDrawingBoard
                      initialGrid={preFilledGrid}
                      onSave={handleDrawingSave}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
