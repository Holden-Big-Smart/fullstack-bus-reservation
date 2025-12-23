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
  // ✨ 新增：用于框选逻辑的状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null); // {x, y}
  const [gridSnapshot, setGridSnapshot] = useState(null); // 按下时的网格快照

  // 初始化逻辑 (保持之前提供的无损缩放 useEffect 或简单初始化)
  useEffect(() => {
    if (initialGrid && initialGrid.length > 0) {
      setGrid(recalculateLabels(initialGrid));
      setRows(initialGrid.length);
      setCols(initialGrid[0].length);
    } else {
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
  }, [initialGrid]);

  // 2. 核心函数：无损调整网格尺寸
  const resizeGrid = (newRows, newCols) => {
    setGrid((prevGrid) => {
      const updatedGrid = Array(newRows)
        .fill()
        .map((_, y) =>
          Array(newCols)
            .fill()
            .map((_, x) => {
              // 如果旧网格中这个坐标有数据，则保留它
              if (prevGrid[y] && prevGrid[y][x]) {
                return { ...prevGrid[y][x], x, y }; // 确保坐标信息同步
              }
              // 否则，创建一个新的空格子
              return { x, y, type: "empty", labelGrid: "", labelSeq: "" };
            })
        );
      return recalculateLabels(updatedGrid);
    });
  };

  // 3. 处理输入框变化
  const handleRowsChange = (val) => {
    const newR = Math.max(1, Number(val)); // 至少 1 行
    setRows(newR);
    resizeGrid(newR, cols);
  };

  const handleColsChange = (val) => {
    const newC = Math.max(1, Number(val)); // 至少 1 列
    setCols(newC);
    resizeGrid(rows, newC);
  };

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

  // ✨ 核心功能：计算并应用矩阵框选
  const applyBoxSelect = (currentX, currentY) => {
    if (!dragStart || !gridSnapshot) return;

    const startX = Math.min(dragStart.x, currentX);
    const endX = Math.max(dragStart.x, currentX);
    const startY = Math.min(dragStart.y, currentY);
    const endY = Math.max(dragStart.y, currentY);

    // 基于快照生成新网格，避免拖拽过程中的“涂鸦叠加”
    const nextGrid = gridSnapshot.map((row, y) =>
      row.map((cell, x) => {
        if (x >= startX && x <= endX && y >= startY && y <= endY) {
          return { ...cell, type: activeTool };
        }
        return cell;
      })
    );

    setGrid(recalculateLabels(nextGrid));
  };

  const handleMouseDown = (x, y) => {
    setIsDragging(true);
    setDragStart({ x, y });
    setGridSnapshot([...grid.map((row) => [...row])]); // 深度克隆当前网格作为快照

    // 点击单点也生效
    const newGrid = grid.map((row, ry) =>
      row.map((cell, cx) =>
        ry === y && cx === x ? { ...cell, type: activeTool } : cell
      )
    );
    setGrid(recalculateLabels(newGrid));
  };

  const handleMouseEnter = (x, y) => {
    if (isDragging) {
      applyBoxSelect(x, y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setGridSnapshot(null);
  };
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
      className="flex flex-col h-full bg-white select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // 鼠标离开画板区域也停止拖拽
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
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <span>行(Rows):</span>
            <input
              type="number"
              value={rows}
              onChange={(e) => handleRowsChange(e.target.value)}
              className="w-16 border-2 border-slate-200 rounded px-2 py-1 focus:border-blue-500 outline-none"
            />
            <span className="ml-2">列(Cols):</span>
            <input
              type="number"
              value={cols}
              onChange={(e) => handleColsChange(e.target.value)}
              className="w-16 border-2 border-slate-200 rounded px-2 py-1 focus:border-blue-500 outline-none"
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
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                onMouseDown={() => handleMouseDown(x, y)}
                onMouseEnter={() => handleMouseEnter(x, y)}
                className={clsx(
                  "w-14 h-14 rounded-md border flex flex-col items-center justify-center cursor-crosshair transition-all duration-75 relative",
                  cell.type === "seat" &&
                    "bg-green-500 border-green-600 text-white scale-100",
                  cell.type === "driver" &&
                    "bg-blue-600 border-blue-700 text-white",
                  cell.type === "aisle" && "bg-cyan-100 border-cyan-200",
                  cell.type === "empty" &&
                    "bg-slate-50 border-slate-200 hover:bg-slate-100"
                )}
              >
                {cell.type === "seat" && (
                  <>
                    <span className="text-[9px] absolute top-1 font-bold opacity-80">
                      {cell.labelGrid}
                    </span>
                    <User size={18} />
                    <span className="text-[11px] mt-1 font-black">
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
        <div className="flex items-center gap-4">
          <span className="text-sm">
            当前座位数:{" "}
            <span className="text-green-400 font-bold">{seatCount}</span>
          </span>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Info size={14} /> 提示：点击并【斜向拖拽】可快速创建矩形座位区
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusDrawingBoard;
