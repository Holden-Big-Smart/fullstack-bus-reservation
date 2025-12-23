import React, { useState, useEffect, useRef } from "react";
import { User, MoveRight, Eraser, Save, Trash2, Info } from "lucide-react";
import clsx from "clsx";

// 工具类型定义
const TOOLS = {
  SEAT: {
    id: "seat",
    label: "座位",
    color: "bg-green-500",
    icon: <User size={16} />,
  },
  DRIVER: { id: "driver", label: "司机", color: "bg-blue-600", icon: null },
  AISLE: {
    id: "aisle",
    label: "过道",
    color: "bg-cyan-100",
    icon: <MoveRight size={14} className="text-cyan-600" />,
  },
  EMPTY: {
    id: "empty",
    label: "橡皮擦",
    color: "bg-slate-100",
    icon: <Eraser size={16} />,
  },
};

const BusDrawingBoard = ({
  initialRows = 10,
  initialCols = 5,
  initialGrid = null,
  onSave,
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [grid, setGrid] = useState([]);
  const [activeTool, setActiveTool] = useState("seat");
  const [isDrawing, setIsDrawing] = useState(false);

  // 初始化或加载数据
  useEffect(() => {
    if (initialGrid && initialGrid.length > 0) {
      // 如果有预设网格，直接加载并计算编号
      setGrid(recalculateLabels(initialGrid));
      setRows(initialGrid.length);
      setCols(initialGrid[0].length);
    } else {
      // 否则创建空网格
      const newGrid = Array(rows)
        .fill()
        .map((_, y) =>
          Array(cols)
            .fill()
            .map((_, x) => ({
              x,
              y,
              type: "empty",
              labelGrid: "",
              labelSeq: "",
            }))
        );
      setGrid(newGrid);
    }
  }, [initialGrid]); // 注意这里只在 initialGrid 改变时触发，避免手动调节行列时被覆盖
  // 核心逻辑：自动计算双编号系统

  const recalculateLabels = (currentGrid) => {
    let seatCounter = 0;
    const updatedGrid = currentGrid.map((row, y) => {
      return row.map((cell, x) => {
        if (cell.type === "seat") {
          seatCounter++;
          // 编号1: 空间编号 (1A, 1B...)
          const colLetter = String.fromCharCode(65 + x);
          const labelGrid = `${y + 1}${colLetter}`;
          // 编号2: 逻辑序号 (01, 02...)
          const labelSeq = seatCounter.toString().padStart(2, "0");
          return { ...cell, labelGrid, labelSeq };
        }
        return { ...cell, labelGrid: "", labelSeq: "" };
      });
    });
    return updatedGrid;
  };

  // 处理涂色动作
  const handlePaint = (x, y) => {
    const newGrid = [...grid];
    if (newGrid[y][x].type === activeTool) return; // 避免重复更新

    newGrid[y][x] = { ...newGrid[y][x], type: activeTool };
    const labeledGrid = recalculateLabels(newGrid);
    setGrid(labeledGrid);
  };

  const onMouseDown = (x, y) => {
    setIsDrawing(true);
    handlePaint(x, y);
  };

  const onMouseEnter = (x, y) => {
    if (isDrawing) handlePaint(x, y);
  };

  const stopDrawing = () => setIsDrawing(false);

  // 统计信息
  const seatCount = grid.flat().filter((c) => c.type === "seat").length;

  // 修改 handleRowsColsChange (手动调整行列时清空或裁剪，此处为简化逻辑建议手动调整行列时提示会重置)
  const updateLayoutSize = (newR, newC) => {
    if (window.confirm("调整行列将重置当前绘图，确认吗？")) {
      setRows(newR);
      setCols(newC);
      // 这里会触发上面的 useEffect 生成空网格
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden"
      onMouseLeave={stopDrawing}
      onMouseUp={stopDrawing}
    >
      {/* 顶部工具栏 */}
      <div className="p-4 border-b bg-slate-50 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold mr-2 text-slate-600">
            选择工具:
          </span>
          {Object.values(TOOLS).map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md transition-all border-2",
                activeTool === tool.id
                  ? "border-slate-800 shadow-md scale-105"
                  : "border-transparent opacity-70"
              )}
            >
              <div className={clsx("w-4 h-4 rounded", tool.color)}></div>
              <span className="text-sm font-medium">{tool.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span>行:</span>
            <input
              type="number"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-12 border rounded px-1"
            />
            <span>列:</span>
            <input
              type="number"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-12 border rounded px-1"
            />
          </div>
          <button
            onClick={() => onSave(grid)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Save size={18} /> 完成绘图
          </button>
        </div>
      </div>

      {/* 中部画板 */}
      <div className="flex-1 overflow-auto p-12 bg-slate-200 flex justify-center items-start">
        <div
          className="bg-white p-8 rounded-xl shadow-2xl border-4 border-slate-400 relative"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "4px",
          }}
        >
          {/* 车头装饰 */}
          <div className="absolute -top-12 left-0 right-0 text-center font-bold text-slate-400 tracking-[1em] uppercase text-xs">
            --- 车头 FRONT ---
          </div>

          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                onMouseDown={() => onMouseDown(x, y)}
                onMouseEnter={() => onMouseEnter(x, y)}
                className={clsx(
                  "w-14 h-14 rounded-md border flex flex-col items-center justify-center cursor-crosshair transition-colors select-none relative group",
                  cell.type === "seat" &&
                    "bg-green-500 border-green-600 text-white",
                  cell.type === "driver" &&
                    "bg-blue-600 border-blue-700 text-white",
                  cell.type === "aisle" && "bg-cyan-100 border-cyan-200",
                  cell.type === "empty" &&
                    "bg-slate-50 border-slate-200 hover:bg-slate-100"
                )}
              >
                {cell.type === "seat" && (
                  <>
                    <span className="text-[9px] leading-none absolute top-1 font-bold opacity-80">
                      {cell.labelGrid}
                    </span>
                    <User size={18} />
                    <span className="text-[11px] leading-none mt-1 font-black">
                      {cell.labelSeq}
                    </span>
                  </>
                )}
                {cell.type === "driver" && (
                  <span className="text-[10px] font-bold">司机</span>
                )}
                {cell.type === "aisle" && (
                  <MoveRight size={16} className="text-cyan-400 opacity-50" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="p-4 bg-slate-800 text-white flex justify-between items-center px-8">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">
              当前座位数:{" "}
              <span className="font-bold text-lg text-green-400">
                {seatCount}
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-400 italic flex items-center gap-1">
            <Info size={14} /> 按住鼠标左键并拖拽可以快速涂色
          </p>
        </div>
        <div className="text-xs text-slate-400">
          双编号预览: [空间编号] + [顺序编号]
        </div>
      </div>
    </div>
  );
};

export default BusDrawingBoard;
