import React from 'react';
import { User,  XCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

// 这是一个纯展示组件(Presentational Component)
// 它只负责显示，点击事件通过 props 抛出给父组件处理
export default function SeatMap({ bus, onSeatClick, isStaffView }) {
  if (!bus) return <div className="text-center p-10">加载中...</div>;

  const { rows, cols, aisleCols, driverPos, bookings = {}, doors = [] } = bus;

  // 生成网格数据结构
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    // 最后一排通常是 5 人连座，不设走廊
    const isLastRow = r === rows - 1;

    for (let c = 0; c < cols; c++) {
      const seatId = `${r}-${c}`;
      const isAisle = !isLastRow && aisleCols.includes(c); // 判断是否是走廊位置
      const booking = bookings[seatId];
      const isDoor = doors.includes(seatId);

      rowSeats.push({
        id: seatId,
        r, c,
        isAisle,
        booking,
        isDoor
      });
    }
    grid.push(rowSeats);
  }

  return (
    <div className="inline-block bg-white p-6 rounded-3xl shadow-xl border-4 border-slate-200 relative min-w-[320px]">
      {/* 1. 车头/司机区域 */}
      <div className={clsx(
        "flex mb-8 border-b-2 border-dashed border-slate-200 pb-4",
        driverPos === 'right' ? "flex-row-reverse" : "flex-row"
      )}>
        <div className="flex flex-col items-center px-4">
          <div className="w-12 h-12 rounded-full border-4 border-slate-600 relative bg-slate-100 mb-1">
            {/* 简易方向盘图标 */}
            <div className={clsx(
              "absolute top-1/2 w-8 h-2 bg-slate-600 -translate-y-1/2 rotate-45",
              driverPos === 'right' ? "right-1" : "left-1"
            )}></div>
          </div>
          <span className="text-xs font-bold text-slate-500">司机</span>
        </div>
        <div className="flex-1 flex items-end justify-center pb-2">
          <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">车头 (FRONT)</span>
        </div>
      </div>

      {/* 2. 座位网格 */}
      <div className="flex flex-col gap-3">
        {grid.map((row, rIndex) => (
          <div key={rIndex} className="flex justify-center gap-3 relative">
            {/* 排号标记 */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
              {rIndex + 1}
            </div>

            {row.map((seat, cIndex) => (
              <React.Fragment key={seat.id}>
                {/* 走廊占位 */}
                {seat.isAisle && <div className="w-8 shrink-0" />}

                {/* 座位本体 */}
                <button
                  onClick={() => onSeatClick(seat)}
                  disabled={!isStaffView && (seat.booking || seat.isDoor)} // 客户只能点空位
                  className={clsx(
                    "w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-all relative group",
                    "border shadow-sm",
                    // 样式逻辑
                    seat.isDoor 
                      ? "bg-green-100 border-green-400 text-green-700 cursor-not-allowed" // 安全出口
                      : seat.booking 
                        ? (seat.booking.status === 'confirmed' 
                            ? "bg-orange-500 border-orange-600 text-white" // 已确认
                            : "bg-yellow-400 border-yellow-500 text-white") // 仅预定
                        : "bg-white border-slate-300 hover:border-blue-500 hover:shadow-md text-slate-500" // 空位
                  )}
                >
                  {/* 座位内容 */}
                  {seat.isDoor ? (
                    <span className="text-[10px] font-bold leading-tight">安全<br/>出口</span>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold opacity-60 mb-0.5">
                        {String.fromCharCode(65 + seat.c)}
                      </span>
                      {seat.booking ? (
                        <User size={16} fill="currentColor" />
                      ) : (
                        <div className="w-6 h-1 bg-slate-200 rounded-full"></div>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip (仅员工可见) */}
                  {isStaffView && seat.booking && (
                    <div className="absolute bottom-full mb-2 z-20 hidden group-hover:block w-max bg-slate-800 text-white text-xs p-2 rounded shadow-xl">
                      <p className="font-bold">{seat.booking.name}</p>
                      <p>{seat.booking.phone}</p>
                    </div>
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>

      {/* 3. 车尾 */}
      <div className="mt-8 border-t-2 border-slate-200 pt-2 text-center text-xs text-slate-400 uppercase tracking-widest">
        车尾 (BACK)
      </div>
    </div>
  );
}
