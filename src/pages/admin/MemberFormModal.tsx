import { useState } from 'react'
import { useApp } from '../../context'
import { Member } from '../../types'
import { MAXGEN } from '../../constants'

const primary =
  'rounded-md bg-maroon hover:bg-maroon-dark text-white font-semibold px-4 py-2 text-sm shadow-sm transition-colors'
const outline =
  'rounded-md border border-stone-300 hover:bg-stone-50 px-3 py-2 text-sm bg-white transition-colors'
const inp =
  'w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400'

export function MemberFormModal({
  initial,
  onClose,
}: {
  initial: Member | null
  onClose: () => void
}) {
  const { members, saveMember } = useApp()
  const [f, setF] = useState<Member>(
    initial ?? {
      id: 'm' + Date.now(),
      name: '',
      gender: 'M',
      gen: 2,
      status: 'alive',
      birth: null,
      death: null,
      gio: null,
      fatherId: null,
      motherId: null,
      spouseOf: null,
      note: '',
      hometown: 'Đông Triều, Quảng Ninh',
      bio: '',
    }
  )

  const [bUnk, setBUnk] = useState(initial ? initial.birth === null : false)
  const [dUnk, setDUnk] = useState(
    initial ? initial.status === 'dead' && initial.death === null : false
  )
  const [errs, setErrs] = useState<Record<string, string>>({})

  const set = (p: Partial<Member>) => setF((x) => ({ ...x, ...p }))
  const blood = members.filter((m) => !m.spouseOf && m.id !== f.id)
  const fathers = blood.filter((m) => m.gender === 'M' && m.gen === f.gen - 1)
  const mothers = members.filter((m) => m.spouseOf === f.fatherId && m.gender === 'F')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (!f.name.trim()) er.name = 'Vui lòng nhập họ tên.'
    if (f.gen < 1 || f.gen > MAXGEN) er.gen = `Đời từ 1 đến ${MAXGEN}.`
    if (!bUnk && (!f.birth || f.birth < 1000 || f.birth > 2100))
      er.birth = 'Nhập năm sinh hợp lệ hoặc tick “Không rõ”.'
    if (
      f.status === 'dead' &&
      !dUnk &&
      (!f.death || f.death < 1000 || f.death > 2100 || (f.birth && f.death < f.birth))
    )
      er.death = 'Năm mất không hợp lệ.'
    if (f.status === 'dead' && f.gio && !/^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])$/.test(f.gio))
      er.gio = 'Nhập theo định dạng dd/mm.'
    if (!f.spouseOf && f.gen > 1 && !f.fatherId) er.father = 'Vui lòng chọn cha.'
    setErrs(er)
    if (Object.keys(er).length) return

    saveMember(
      {
        ...f,
        name: f.name.trim(),
        birth: bUnk ? null : f.birth,
        death: f.status === 'dead' && !dUnk ? f.death : null,
        gio: f.status === 'dead' ? f.gio || null : null,
      },
      !initial
    )
    onClose()
  }

  const Field = ({ l, k, children }: { l: string; k?: string; children: any }) => (
    <div>
      <label className="block text-sm font-medium mb-1 text-stone-700">{l}</label>
      {children}
      {k && errs[k] && (
        <p className="text-xs text-red-700 mt-1" role="alert">
          {errs[k]}
        </p>
      )}
    </div>
  )

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-stone-200 rounded-lg p-5 max-w-3xl space-y-4 fade shadow-sm"
    >
      <h2 className="text-lg font-semibold text-stone-900">
        {initial ? 'Sửa thành viên' : 'Thêm thành viên'}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field l="Họ tên *" k="name">
          <input className={inp} value={f.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field l="Giới tính">
          <select
            className={inp}
            value={f.gender}
            onChange={(e) => set({ gender: e.target.value as any })}
          >
            <option value="M">Nam</option>
            <option value="F">Nữ</option>
          </select>
        </Field>
        <Field l="Đời *" k="gen">
          <input
            type="number"
            min={1}
            max={MAXGEN}
            className={inp}
            value={f.gen}
            onChange={(e) => set({ gen: +e.target.value, fatherId: null, motherId: null })}
          />
        </Field>
        <Field l="Là vợ/chồng của">
          <select
            className={inp}
            value={f.spouseOf ?? ''}
            onChange={(e) =>
              set({ spouseOf: e.target.value || null, fatherId: null, motherId: null })
            }
          >
            <option value="">Không (thành viên huyết thống)</option>
            {blood.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (đời {m.gen})
              </option>
            ))}
          </select>
        </Field>
        {!f.spouseOf && (
          <>
            <Field l="Cha" k="father">
              <select
                className={inp}
                value={f.fatherId ?? ''}
                onChange={(e) => set({ fatherId: e.target.value || null, motherId: null })}
              >
                <option value="">{f.gen === 1 ? 'Không (cụ tổ)' : '— Chọn cha —'}</option>
                {fathers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field l="Mẹ">
              <select
                className={inp}
                value={f.motherId ?? ''}
                onChange={(e) => set({ motherId: e.target.value || null })}
              >
                <option value="">— Chưa rõ —</option>
                {mothers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 border-t border-stone-100 pt-4">
        <Field l="Trạng thái">
          <div className="flex gap-4 text-sm py-2">
            {(['alive', 'dead'] as const).map((s) => (
              <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  checked={f.status === s}
                  onChange={() => set({ status: s })}
                />
                {s === 'alive' ? 'Còn sống' : 'Đã mất'}
              </label>
            ))}
          </div>
        </Field>
        <Field l="Năm sinh" k="birth">
          <div className="flex items-center gap-3">
            <input
              type="number"
              disabled={bUnk}
              className={`${inp} disabled:bg-stone-100`}
              value={bUnk ? '' : f.birth ?? ''}
              onChange={(e) => set({ birth: e.target.value ? +e.target.value : null })}
            />
            <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
              <input
                type="checkbox"
                checked={bUnk}
                onChange={(e) => setBUnk(e.target.checked)}
              />
              Không rõ
            </label>
          </div>
        </Field>
        {f.status === 'dead' && (
          <>
            <Field l="Năm mất" k="death">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  disabled={dUnk}
                  className={`${inp} disabled:bg-stone-100`}
                  value={dUnk ? '' : f.death ?? ''}
                  onChange={(e) => set({ death: e.target.value ? +e.target.value : null })}
                />
                <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dUnk}
                    onChange={(e) => setDUnk(e.target.checked)}
                  />
                  Không rõ năm mất
                </label>
              </div>
            </Field>
            <Field l="Ngày giỗ (âm lịch, dd/mm) – không bắt buộc" k="gio">
              <input
                className={inp}
                placeholder="21/07"
                value={f.gio ?? ''}
                onChange={(e) => set({ gio: e.target.value })}
              />
            </Field>
          </>
        )}
      </div>

      <div className="grid gap-4 border-t border-stone-100 pt-4">
        <Field l="Ảnh">
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const r = new FileReader()
              r.onload = () => set({ photo: String(r.result) })
              r.readAsDataURL(file)
            }}
          />
          {f.photo && (
            <img src={f.photo} alt="" className="h-20 mt-2 rounded border object-cover" />
          )}
        </Field>
        <Field l="Quê quán">
          <input
            className={inp}
            value={f.hometown}
            onChange={(e) => set({ hometown: e.target.value })}
          />
        </Field>
        <Field l="Ghi chú (nơi ở, nghề nghiệp)">
          <input
            className={inp}
            value={f.note}
            onChange={(e) => set({ note: e.target.value })}
          />
        </Field>
        <Field l="Tiểu sử">
          <textarea
            rows={4}
            className={inp}
            value={f.bio}
            onChange={(e) => set({ bio: e.target.value })}
          />
        </Field>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className={primary}>
          Lưu
        </button>
        <button type="button" className={outline} onClick={onClose}>
          Hủy
        </button>
      </div>
    </form>
  )
}
